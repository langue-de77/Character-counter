// --------------------------------------------------
// DOM 要素を取得
// - ページ上の入力欄や表示領域をまとめて参照します
// --------------------------------------------------
const input = document.getElementById("input");
const specificInput = document.getElementById("specific");
const counter = document.getElementById("counter");
const ex0Counter = document.getElementById("ex0Counter");
const ex1Counter = document.getElementById("ex1Counter");
const specificCounter = document.getElementById("specificCounter");
const calculationResult = document.getElementById("calculationResult");
const menuButton = document.getElementById("menuButton");
const filterMenu = document.getElementById("filterMenu");
const filterCheckboxes = document.querySelectorAll("[data-filter]");
const resultRows = document.querySelectorAll(".result-card[data-result]");

function applyResultFilters() {
  // チェックされた filter の data-filter 値を集める
  const visibleResults = new Set(
    Array.from(filterCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.dataset.filter),
  );

  // 各結果カードの data-result と照合して表示/非表示を切り替える
  resultRows.forEach((row) => {
    row.classList.toggle("is-hidden", !visibleResults.has(row.dataset.result));
  });
}

function toggleFilterMenu(forceOpen) {
  // メニューの開閉を制御するユーティリティ
  const shouldOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !filterMenu.classList.contains("is-open");
  filterMenu.classList.toggle("is-open", shouldOpen);
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
  menuButton.setAttribute(
    "aria-label",
    shouldOpen ? "結果フィルタを閉じる" : "結果フィルタを開く",
  );
}

if (menuButton && filterMenu) {
  menuButton.addEventListener("click", () => toggleFilterMenu());
}

filterCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", applyResultFilters);
});

// メニュー以外のクリックでフィルタメニューを閉じる
document.addEventListener("click", (event) => {
  if (!filterMenu.classList.contains("is-open")) return;
  if (filterMenu.contains(event.target) || menuButton.contains(event.target))
    return;
  toggleFilterMenu(false);
});

// Escape キーでメニューを閉じる
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    filterMenu &&
    filterMenu.classList.contains("is-open")
  )
    toggleFilterMenu(false);
});

// 初期フィルタ適用
applyResultFilters();

// 入力の変更に応じてカウンタを更新
input.addEventListener("input", () => updateCounter(input.value));
specificInput.addEventListener("input", () =>
  updateSpecificCounter(input.value, specificInput.value),
);
// 全体の文字数や各種カウント、式の評価結果をまとめて更新する
function updateCounter(text) {
  const length = text.length;
  const excludedLFLength = countExcludedLF(text);
  const excludedLFAndSpaceLength = countExcludedLFAndSpace(text);
  updateSpecificCounter(text, specificInput.value);

  counter.textContent = `${length}`;
  ex0Counter.textContent = `${excludedLFLength}`;
  ex1Counter.textContent = `${excludedLFAndSpaceLength}`;

  // 数式評価: テキストから数式に使う文字だけ抽出して評価
  const calculation = evaluateExpression(text.replace(/[^0-9+\-*/.()]/g, ""));
  calculationResult.textContent = calculation !== null ? calculation : "N/A";
}

// 特定文字列の出現回数を表示する
function updateSpecificCounter(text, specificText) {
  let count = 0;
  if (specificText && specificText.length > 0)
    count = countSpecificText(text, specificText);
  specificCounter.textContent = `${count}`;
}

// 改行を除いた長さ
function countExcludedLF(text) {
  return text.replace(/\n/g, "").length;
}

// 空白類（スペース・タブ・改行）を除いた長さ
function countExcludedLFAndSpace(text) {
  return text.replace(/\s/g, "").length;
}

// 特定の文字列の出現回数 (単純 split ベース)
function countSpecificText(text, specificText) {
  return text.split(specificText).length - 1;
}

function evaluateExpression(text) {
  function isValid(text) {
    /*
    四則演算のみの数式を受理するプッシュダウンオートマトン;
    pushdownAutomaton.amを参照;
    */

    // 受理する文字の集合を定義する
    const DE = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    const PE = new Set(["."]);
    const OP = new Set(["("]);
    const CP = new Set([")"]);
    const SY = new Set(["+", "-", "*", "/"]);
    const MI = new Set(["-"]);

    const goal = new Set([2, 4, 5]); // 受理する状態の集合を定義する
    let q = 0; // オートマトンの状態を表す変数 0~4
    let stack = 0; // 括弧の深さを表すスタック
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      switch (q) {
        case 0:
          if (OP.has(c)) {
            stack += 1;
            q = 0;
          } else if (MI.has(c)) q = 0;
          else if (DE.has(c)) q = 2;
          else return false;
          break;
        case 1:
          if (OP.has(c)) {
            stack += 1;
            q = 0;
          } else if (DE.has(c)) q = 2;
          else return false;
          break;
        case 2:
          if (OP.has(c)) {
            stack += 1;
            q = 0;
          } else if (SY.has(c) || MI.has(c)) q = 1;
          else if (DE.has(c)) q = 2;
          else if (PE.has(c)) q = 3;
          else if (CP.has(c)) {
            stack -= 1;
            if (stack < 0) return false;
            q = 5;
          } else return false;
          break;
        case 3:
          if (DE.has(c)) q = 4;
          else return false;
          break;
        case 4:
          if (OP.has(c)) {
            stack += 1;
            q = 0;
          } else if (SY.has(c) || MI.has(c)) q = 1;
          else if (DE.has(c)) q = 4;
          else if (CP.has(c)) {
            stack -= 1;
            if (stack < 0) return false;
            q = 5;
          } else return false;
          break;
        case 5:
          if (OP.has(c)) {
            stack += 1;
            q = 0;
          } else if (SY.has(c) || MI.has(c)) q = 1;
          else if (CP.has(c)) {
            stack -= 1;
            if (stack < 0) return false;
            q = 5;
          } else return false;
          break;
      }
    }
    // 最後の状態が受理状態であり、括弧の深さが 0 であることを確認する
    if (stack != 0) return false;
    if (!goal.has(q)) return false;
    return true;
  }
  function insertZeroForNegativeNumbers(text) {
    // 負数の前に0を挿入し,減算として扱うようにする
    let i = 0;
    while (i < text.length) {
      if (text[i] === "-") {
        if (i === 0 || text[i - 1] === "(")
          text = text.substring(0, i) + "0" + text.substring(i);
        i++;
      }
      i++;
    }
    return text;
  }
  function insertImplicitMultiplicationOperators(text) {
    // 省略された掛け算の記号を挿入する
    let i = 1;
    while (i < text.length) {
      if (text[i] === "(") {
        if ("0123456789".includes(text[i - 1]) || text[i - 1] === ")")
          text = text.substring(0, i) + "*" + text.substring(i);
        i++;
      }
      i++;
    }
    return text;
  }
  function parenthesizeMultiplicationDivision(text) {
    // 掛け算・割り算の優先順位を明示するために括弧で括る
    let i = 0;
    while (i < text.length) {
      // 掛け算・割り算の演算子を見つけたら
      if (text[i] === "*" || text[i] === "/") {
        // 左側の式を把握する
        let left_index = i - 1;
        // 左側の式が括弧で括られている場合は対応する括弧まで遡る
        if (text[left_index] === ")") {
          left_index--;
          let count = 1;
          while (count > 0) {
            if (text[left_index] === ")") count++;
            else if (text[left_index] === "(") count--;
            left_index--;
          }
        } else {
          // 左側の式が括弧で括られていない場合は演算子まで遡る
          while (
            left_index >= 0 &&
            !["+", "-", "*", "/"].includes(text[left_index])
          )
            left_index--;
        }
        // 左側の式の前に括弧を挿入する
        text =
          text.substring(0, left_index + 1) +
          "(" +
          text.substring(left_index + 1);
        i++;

        // 右側の式を把握する
        let right_index = i + 1;
        // 右側の式が括弧で括られている場合は対応する括弧まで進む
        if (text[right_index] === "(") {
          right_index++;
          let count = 1;
          while (count > 0) {
            if (text[right_index] === "(") {
              count++;
            } else if (text[right_index] === ")") {
              count--;
            }
            right_index++;
          }
        } else {
          // 右側の式が括弧で括られていない場合は演算子まで進む
          while (
            right_index < text.length &&
            !["+", "-", "*", "/"].includes(text[right_index])
          )
            right_index++;
        }
        // 右側の式の後ろに括弧を挿入する
        text =
          text.substring(0, right_index) + ")" + text.substring(right_index);
      }
      i++;
    }
    return text;
  }
  function parseInfixExpression(text) {
    // 中置記法の数式を解析して、後置記法の木構造に変換する
    let result = [];
    // 無駄に複数の括弧で括られている場合は外側の括弧を削除する
    while (text && text[0] === "(") {
      let count = 0;
      let removed = false;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "(") count += 1;
        else if (text[i] === ")") count -= 1;
        if (count === 0) {
          if (i === text.length - 1) {
            text = text.substring(1, text.length - 1);
            removed = true;
          }
          break;
        }
      }
      if (!removed) break;
    }
    let count = 0;
    // 演算子の優先順位に従って、後ろから順に演算子を探す
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] === "(") {
        count += 1;
      } else if (text[i] === ")") {
        count -= 1;
      } else if (["+", "-", "*", "/"].includes(text[i]) && count === 0) {
        // 演算子を見つけたら、その演算子を中心に左右の式を分割して再帰的に解析する
        result = [
          parseInfixExpression(text.substring(0, i)),
          parseInfixExpression(text.substring(i + 1)),
          text[i],
        ];
        break;
      }
    }
    if (result.length === 0) {
      // 数値である場合はそのまま返す
      return parseFloat(text);
    }
    return result;
  }
  function evaluatePostfixTree(formula) {
    // 後置記法の木構造を評価する
    if (typeof formula === "number") {
      // 数値である場合はそのまま返す
      return formula;
    }
    // 左右の式を再帰的に評価する
    let left = evaluatePostfixTree(formula[0]);
    let right = evaluatePostfixTree(formula[1]);
    // 演算子に応じて計算する
    switch (formula[2]) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
    }
  }

  // 数式が有効であれば評価し、無効であれば null を返す
  if (isValid(text)) {
    text = insertZeroForNegativeNumbers(text);
    text = insertImplicitMultiplicationOperators(text);
    text = parenthesizeMultiplicationDivision(text);
    const postfix = parseInfixExpression(text);
    return evaluatePostfixTree(postfix);
  } else return null;
}
