const input = document.getElementById("input");
const specificInput = document.getElementById("specific");
const counter = document.getElementById("counter");
const ex0Counter = document.getElementById("ex0Counter");
const ex1Counter = document.getElementById("ex1Counter");
const specificCounter = document.getElementById("specificCounter");
const calculationResult = document.getElementById("calculationResult");

input.addEventListener('input', () => {
    updateCounter(input.value);
});
specificInput.addEventListener('input', () => {
    updateSpecificCounter(input.value, specificInput.value);
});
function updateCounter(text) {
    const length = text.length;
    const excludedLFLength = countExcludedLF(text);
    const excludedLFAndSpaceLength = countExcludedLFAndSpace(text);
    updateSpecificCounter(input.value, specificInput.value);
    counter.textContent = `${length}`;
    ex0Counter.textContent = `${excludedLFLength}`;
    ex1Counter.textContent = `${excludedLFAndSpaceLength}`;
    const calculation = evaluateExpression(text.replace(/[^0-9+\-*/.()]/g, ''));
    if (calculation !== null)
        calculationResult.textContent = `${calculation}`;
    else
        calculationResult.textContent = 'N/A';
}
function updateSpecificCounter(text, specificText) {
    var count = 0;
    if (specificText.length > 0)
        count = countSpecificText(text, specificText);
    specificCounter.textContent = `${count}`;
}
function countExcludedLF(text) {
    return text.split('\n').join('').length;
}
function countExcludedLFAndSpace(text) {
    return text.split('\n').join('').split(' ').join('').length;
}
function countSpecificText(text, specificText) {
    return text.split(specificText).length - 1;
}
function evaluateExpression(text) {
    function isValid(text) {
        // 許可されている文字s
        whitelist = new Set('0123456789+-*/(). ');
        
        // 許可されていない文字が含まれていれば棄却
        if (!text.split('').every(char => whitelist.has(char)))
            return false;
        
        // 空白削除
        text = text.replace(' ', '');
        
        // 空文字列の棄却
        if (!text)
            return false;
        
        // 各文字の前に可能性のある文字sの定義
        allowed_before = {
            '0': new Set('0123456789(+-*/.'),
            '1': new Set('0123456789(+-*/.'),
            '2': new Set('0123456789(+-*/.'),
            '3': new Set('0123456789(+-*/.'),
            '4': new Set('0123456789(+-*/.'),
            '5': new Set('0123456789(+-*/.'),
            '6': new Set('0123456789(+-*/.'),
            '7': new Set('0123456789(+-*/.'),
            '8': new Set('0123456789(+-*/.'),
            '9': new Set('0123456789(+-*/.'),
            '.': new Set('0123456789'),
            '(': new Set('0123456789(+-*/'),
            ')': new Set('0123456789)'),
            '+': new Set('0123456789)'),
            '-': new Set('0123456789)'),
            '*': new Set('0123456789)'),
            '/': new Set('0123456789)'),
        }
        
        // 最初の文字として可能性のある文字sの定義
        if (!text[0] || !new Set('0123456789(').has(text[0]))
            return false;
        
        // 最後の文字として可能性のある文字sの定義
        if (!text[text.length - 1] || !new Set('0123456789.)').has(text[text.length - 1]))
            return false;
        
        // 全ての文字の前が可能性のある文字sか
        for (let i = 1; i < text.length; i++) {
            const current_char = text[i];
            const previous_char = text[i - 1];

            // 現在の文字が許可される文字か、前の文字が許可されているか
            if (!allowed_before[current_char]) {
                return false;
            }
            if (!allowed_before[current_char].has(previous_char)) {
                return false;
            }
        }

        // 括弧のバランスチェック
        let paren_count = 0
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '(')
                paren_count++;
            else if (char === ')')
                paren_count--;
            if (paren_count < 0)
                return false;
        }
        if (paren_count !== 0)
            return false;

        return true;
    }
    function insertImplicitMultiplicationOperators(text) {
        let i = 1;
        while (i < text.length) {
            if (text[i] === '(') {
                if (text[i - 1].match(/\d/) || text[i - 1] === ')')
                    text = text.substring(0, i) + '*' + text.substring(i);
                i++;
            }
            i++;
        }
        return text;
    }
    function parenthesizeMultiplicationDivision(text) {
        let i = 0;
        while (i < text.length) {
            if (text[i] === '*' || text[i] === '/') {
                let left_index = i - 1;
                if (text[left_index] === ')') {
                    left_index--;
                    let count = 1
                    while (count > 0) {
                        if (text[left_index] === ')')
                            count++;
                        else if (text[left_index] === '(')
                            count--;
                        left_index--;
                    }
                }else{
                    while (left_index >= 0 && !['+', '-', '*', '/'].includes(text[left_index]))
                        left_index--;
                }
                text = text.substring(0, left_index + 1) + '(' + text.substring(left_index + 1);
                i++;

                right_index = i + 1
                if (text[right_index] === '(') {
                    right_index++;
                    let count = 1
                    while (count > 0) {
                        if (text[right_index] === '(') {
                            count++;
                        } else if (text[right_index] === ')') {
                            count--;
                        };
                        right_index++;
                    };
                } else {
                    while (right_index < text.length && !['+', '-', '*', '/'].includes(text[right_index]))
                        right_index++;
                }
                text = text.substring(0, right_index) + ')' + text.substring(right_index)
            }
            i++;
        }
        return text
    }
    function parenthesizeAdditionSubtraction(text) {
        let i = text.length - 1
        while (i >= 0) {
            if (['+', '-'].includes(text[i])) {
                let right_index = i + 1
                if (text[right_index] === '(') {
                    right_index += 1
                    count = 1
                    while (right_index < text.length && count > -1) {
                        if (text[right_index] === '(') {
                            count += 1
                        } else if (text[right_index] === ')') {
                            count -= 1
                        }
                        right_index += 1
                    }
                } else {
                    while (right_index < text.length && text[right_index] !== ')') {
                        right_index += 1
                    }
                }
                text = text.substring(0, i+1) + '(' + text.substring(i+1, right_index) + ')' + text.substring(right_index)
            }
            i -= 1
        }
        return text 
    }
    function parseInfixExpression(text) {
        let result = []
        while (text && text[0] === '(') {
            let count = 0
            let removed = false
            for (let i = 0; i < text.length; i++) {
                if (text[i] === '(')
                    count += 1
                else if (text[i] === ')')
                    count -= 1
                if (count === 0) {
                    if (i === text.length - 1) {
                        text = text.substring(1, text.length - 1)
                        removed = true
                    }
                    break
                }
            }
            if (!removed)
                break
        }
        count = 0
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '(') {
                count += 1
            } else if (text[i] === ')') {
                count -= 1
            } else if (['+', '-', '*', '/'].includes(text[i]) && count === 0) {
                result = [parseInfixExpression(text.substring(0, i)), parseInfixExpression(text.substring(i + 1)), text[i]]
            }
        }
        if (result.length === 0) {
            return parseFloat(text)
        }
        return result
    }
    function evaluatePostfixTree(formula) {
        if (typeof formula === 'number') {
            return formula
        }
        let left = evaluatePostfixTree(formula[0])
        let right = evaluatePostfixTree(formula[1])
        if (formula[2] === '+') {
            return left + right
        } else if (formula[2] === '-') {
            return left - right
        } else if (formula[2] === '*') {
            return left * right
        } else if (formula[2] === '/') {
            return left / right
        }
    }

    if (isValid(text)) {
        text = insertImplicitMultiplicationOperators(text)
        text = parenthesizeMultiplicationDivision(text)
        text = parenthesizeAdditionSubtraction(text)
        const postfix = parseInfixExpression(text)
        return evaluatePostfixTree(postfix)
    } else
        return null
}
