const msg: string = "Hello!";
alert(msg);

const styles: Record<string, string> = {
    "Styl 1": "/style-1.css",
    "Styl 2": "/style-2.css",
    "Styl 3": "/style-3.css",
};

let currentStyle: string = "Styl 1";


function applyStyle(styleName: string) {
    const oldLink = document.getElementById("dynamic-style");
    if (oldLink) oldLink.remove();

    const newLink = document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.id = "dynamic-style";
    newLink.href = styles[styleName];

    document.head.appendChild(newLink);

    currentStyle = styleName;
}


function generateStyleLinks() {
    const list = document.querySelector("#style-list") as HTMLOListElement;
    if (!list) return;

    list.innerHTML = "";

    Object.keys(styles).forEach(styleName => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = "#";
        a.textContent = styleName;

        a.onclick = (event) => {
            event.preventDefault();
            applyStyle(styleName);
        };

        li.appendChild(a);
        list.appendChild(li);
    });
}

    document.addEventListener("DOMContentLoaded", () => {
        generateStyleLinks();
        applyStyle(currentStyle);
    });
