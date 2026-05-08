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
    counter.textContent = `${length}`;
    exCounter.textContent = `${excludedLFLength}`;
}

function updateSpecificCounter(text, specificText) {
    var count = 0;
    if (specificText.length > 0)
        count = countSpecificText(text, specificText);
    specificCounter.textContent = `${count}`;
}

function measureExcludedLF(text) {
    return text.split('\n').join('').length;
}

function countSpecificText(text, specificText) {
    return text.split(specificText).length - 1;
}
