import { CodeBlock } from "../types";

/**
 * Translates visual code blocks into clean C language code.
 */
export function generateCCode(blocks: CodeBlock[], indentLevel = 1): string {
  const indent = "    ".repeat(indentLevel);
  const lines: string[] = [];

  for (const block of blocks) {
    if (block.type === "command") {
      switch (block.action) {
        case "move_forward":
          lines.push(`${indent}move();`);
          break;
        case "move_backward":
          lines.push(`${indent}moveBackward();`);
          break;
        case "turn_left":
          lines.push(`${indent}turnLeft();`);
          break;
        case "turn_right":
          lines.push(`${indent}turnRight();`);
          break;
        case "take_battery":
          lines.push(`${indent}collect();`);
          break;
        case "wait":
          lines.push(`${indent}wait();`);
          break;
        case "jump":
          lines.push(`${indent}jump();`);
          break;
      }
    } else if (block.type === "repeat") {
      const varName = block.variable || (indentLevel === 1 ? "i" : indentLevel === 2 ? "j" : "k");
      const start = block.startVal ?? 0;
      const count = block.count ?? 3;
      const op = block.conditionOp || "<";
      lines.push(`${indent}for (int ${varName} = ${start}; ${varName} ${op} ${count}; ${varName}++) {`);
      if (block.commands && block.commands.length > 0) {
        lines.push(generateCCode(block.commands, indentLevel + 1));
      } else {
        lines.push(`${indent}    // body kosong`);
      }
      lines.push(`${indent}}`);
    } else if (block.type === "while") {
      let condStr = "pathClear()";
      if (block.condition === "has_battery") condStr = "hasBattery()";
      else if (block.condition === "not_at_target") condStr = "!atTarget()";
      else if (block.condition === "energy_gt_zero") condStr = "energy > 0";

      lines.push(`${indent}while (${condStr}) {`);
      if (block.commands && block.commands.length > 0) {
        lines.push(generateCCode(block.commands, indentLevel + 1));
      } else {
        lines.push(`${indent}    // body kosong`);
      }
      lines.push(`${indent}}`);
    } else if (block.type === "do_while") {
      let condStr = "pathClear()";
      if (block.condition === "has_battery") condStr = "hasBattery()";
      else if (block.condition === "not_at_target") condStr = "!atTarget()";

      lines.push(`${indent}do {`);
      if (block.commands && block.commands.length > 0) {
        lines.push(generateCCode(block.commands, indentLevel + 1));
      } else {
        lines.push(`${indent}    // body kosong`);
      }
      lines.push(`${indent}} while (${condStr});`);
    } else if (block.type === "break") {
      lines.push(`${indent}break;`);
    } else if (block.type === "continue") {
      lines.push(`${indent}continue;`);
    } else if (block.type === "if") {
      let condStr = "atTarget()";
      if (block.condition === "path_clear") condStr = "pathClear()";
      else if (block.condition === "has_battery") condStr = "hasBattery()";

      lines.push(`${indent}if (${condStr}) {`);
      if (block.commands && block.commands.length > 0) {
        lines.push(generateCCode(block.commands, indentLevel + 1));
      }
      lines.push(`${indent}}`);
    }
  }

  return lines.join("\n");
}

/**
 * Generates compact, user-facing solution code containing only the primary commands and loops.
 * Zero boilerplate, easily readable, and directly mapped to what the student composed.
 */
export function generateUserSolutionCode(blocks: CodeBlock[], indentLevel = 0): string {
  const indent = "  ".repeat(indentLevel);
  const lines: string[] = [];

  for (const block of blocks) {
    if (block.type === "command") {
      switch (block.action) {
        case "move_forward":
          lines.push(`${indent}MAJU;`);
          break;
        case "move_backward":
          lines.push(`${indent}MUNDUR;`);
          break;
        case "turn_left":
          lines.push(`${indent}KIRI;`);
          break;
        case "turn_right":
          lines.push(`${indent}KANAN;`);
          break;
        case "take_battery":
          lines.push(`${indent}AMBIL BATERAI;`);
          break;
        case "wait":
          lines.push(`${indent}TUNGGU;`);
          break;
      }
    } else if (block.type === "repeat") {
      const count = block.count ?? 3;
      lines.push(`${indent}for (int i = 0; i < ${count}; i++) {`);
      if (block.commands && block.commands.length > 0) {
        lines.push(generateUserSolutionCode(block.commands, indentLevel + 1));
      }
      lines.push(`${indent}}`);
    } else if (block.type === "while") {
      let condStr = "pathClear()";
      if (block.condition === "has_battery") condStr = "hasBattery()";
      else if (block.condition === "not_at_target") condStr = "!atTarget()";

      lines.push(`${indent}while (${condStr}) {`);
      if (block.commands && block.commands.length > 0) {
        lines.push(generateUserSolutionCode(block.commands, indentLevel + 1));
      }
      lines.push(`${indent}}`);
    } else if (block.type === "break") {
      lines.push(`${indent}break;`);
    } else if (block.type === "continue") {
      lines.push(`${indent}continue;`);
    }
  }

  return lines.join("\n");
}

/**
 * Returns a full C program with standard boilerplate.
 */
export function generateFullCProgram(blocks: CodeBlock[], levelTitle?: string): string {
  const body = generateCCode(blocks, 1);
  return `/* 
 * LOOPYU C Programming Game
 * ${levelTitle ? `Tantangan: ${levelTitle}` : "Solusi Perulangan"}
 */

#include <stdio.h>
#include "loopyu_robot.h"

int main() {
${body || "    // Masukkan balok kode untuk melihat kode C"}
    return 0;
}`;
}
