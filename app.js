const input = document.getElementById("input");
const specificInput = document.getElementById("specific");
const counter = document.getElementById("counter");
const exCounter = document.getElementById("exCounter");
const specificCounter = document.getElementById("specificCounter");

input.addEventListener('input', () => {
    updateCounter(input.value);
});

specificInput.addEventListener('input', () => {
    updateSpecificCounter(input.value, specificInput.value);
});

function updateCounter(text) {
    const length = text.length;
    const excludedLFLength = measureExcludedLF(text);
    updateSpecificCounter(input.value, specificInput.value);
    console.log(length, excludedLFLength);
    counter.innerHTML = `文字数: ${length}`;
    exCounter.innerHTML = `改行除く: ${excludedLFLength}`;
}

function updateSpecificCounter(text, specificText) {
    var count = 0;
    if (specificText.length > 0)
        count = countSpecificText(text, specificText);
    specificCounter.innerHTML = `特定の文字列の数: ${count}`;
}

function measureExcludedLF(text) {
    return text.split('\n').join('').length;
}

function countSpecificText(text, specificText) {
    return text.split(specificText).length - 1;
}
