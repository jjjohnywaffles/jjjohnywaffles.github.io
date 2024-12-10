function parseAndSplitExpression(funcExpr) {
    return funcExpr.replace(/-/g, " - ").replace(/\+/g, " + ").split(" ");
}

function calculateManualDerivative(funcExpr) {
    const terms = parseAndSplitExpression(funcExpr);
    const derivativeTerms = [];

    terms.forEach((term) => {
        term = term.trim();
        if (term.includes("x**")) {
            const parts = term.split("x**");
            const coef = parts[0].replace("*", "").trim() === "" ? 1 : parseInt(parts[0]);
            const power = parseInt(parts[1]);
            const newCoef = coef * power;
            const newPower = power - 1;
            if (newPower === 0) {
                derivativeTerms.push(`${newCoef}`);
            } else if (newPower === 1) {
                derivativeTerms.push(`${newCoef}*x`);
            } else {
                derivativeTerms.push(`${newCoef}*x**${newPower}`);
            }
        } else if (term.includes("x")) {
            const coef = term.replace("*x", "").trim() === "" ? 1 : parseInt(term.replace("*x", "").trim());
            derivativeTerms.push(`${coef}`);
        }
    });

    return derivativeTerms.join(" + ").replace(/\+ -/g, "- ");
}

function evaluateFunction(funcExpr, xVals) {
    return xVals.map((x) => {
        let expr = funcExpr.replace(/x/g, `(${x})`);
        return eval(expr);
    });
}

function calculate() {
    const inputFunction = document.getElementById("function").value;
    const firstDerivative = calculateManualDerivative(inputFunction);
    const secondDerivative = calculateManualDerivative(firstDerivative);

    document.getElementById("original").textContent = "Original Function: " + inputFunction;
    document.getElementById("first").textContent = "First Derivative: " + firstDerivative;
    document.getElementById("second").textContent = "Second Derivative: " + secondDerivative;

    // Generate and plot graphs
    const xVals = Array.from({ length: 100 }, (_, i) => i - 50); // Range from -50 to 50
    const yVals = evaluateFunction(inputFunction, xVals);
    const yPrimeVals = evaluateFunction(firstDerivative, xVals);
    const yDoublePrimeVals = evaluateFunction(secondDerivative, xVals);

    drawGraph(xVals, yVals, yPrimeVals, yDoublePrimeVals);
}

function drawGraph(xVals, yVals, yPrimeVals, yDoublePrimeVals) {
    const stacked = document.getElementById("stacked").checked; // Check if user wants stacked or side-by-side

    const ctx = document.getElementById("chart").getContext("2d");
    const config = {
        type: "line",
        data: {
            labels: xVals,
            datasets: [
                {
                    label: "f(x)",
                    data: yVals,
                    borderColor: "blue",
                    fill: false,
                },
                {
                    label: "f'(x)",
                    data: yPrimeVals,
                    borderColor: "orange",
                    fill: false,
                },
                {
                    label: "f''(x)",
                    data: yDoublePrimeVals,
                    borderColor: "green",
                    fill: false,
                },
            ],
        },
        options: {
            plugins: {
                legend: { display: true },
            },
            scales: {
                x: {
                    title: { display: true, text: "x" },
                },
                y: {
                    title: { display: true, text: "y" },
                    suggestedMin: -1000, // Adjust to better fit your data
                    suggestedMax: 1000, // Adjust to better fit your data
                },
            },
        },
    };

    if (!stacked) {
        config.options.aspectRatio = 2; // Widen the chart for side-by-side
    }

    // Destroy any existing chart before creating a new one
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, config);
}
