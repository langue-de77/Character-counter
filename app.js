const input = document.getElementById("input");
const counter = document.getElementById("counter");
input.addEventListener('input', () => {
    updateCounter(input.value);
});

function updateCounter(text) {
    const length = text.length;
    console.log(length);
    counter.textContent = `文字数: ${length}`;
}

