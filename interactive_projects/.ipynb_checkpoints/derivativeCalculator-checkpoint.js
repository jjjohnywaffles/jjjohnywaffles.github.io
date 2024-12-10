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
            const coef = parts[0].replace("*", "").trim() === "" ? 1 : parseFloat(parts[0]);
            const power = parseFloat(parts[1]);
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
            const coef = term.replace("*x", "").trim() === "" ? 1 : parseFloat(term.replace("*x", "").trim());
            derivativeTerms.push(`${coef}`);
        }
    });

    return derivativeTerms.join(" + ").replace(/\+ -/g, "- ");
}

function evaluateFunction(funcExpr, xVals) {
    return xVals.map((x) => {
        try {
            const expr = funcExpr.replace(/x/g, `(${x})`);
            return eval(expr);
        } catch (error) {
            console.error("Error evaluating expression:", error);
            return NaN;
        }
    });
}

function generateGraph(funcExpr, firstDerivative, secondDerivative) {
    // Generate x values from -100 to 100
    const xVals = Array.from({ length: 201 }, (_, i) => -100 + i).map((x) => Math.round(x * 100) / 100); // Ensures clean integers

    // Evaluate function and derivatives
    const yVals = evaluateFunction(funcExpr, xVals);
    const yPrimeVals = evaluateFunction(firstDerivative, xVals);
    const yDoublePrimeVals = evaluateFunction(secondDerivative, xVals);

    const ctx = document.getElementById("chart").getContext("2d");
    const config = {
        type: "line",
        data: {
            labels: xVals.map((x) => x.toFixed(0)), // Convert x values to clean integers for display
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
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "x" },
                    ticks: {
                        callback: (value, index) => {
                            // Display every 10th tick for clarity
                            return index % 10 === 0 ? value : "";
                        },
                    },
                },
                y: {
                    title: { display: true, text: "y" },
                    suggestedMin: Math.min(...yVals, ...yPrimeVals, ...yDoublePrimeVals) * 1.2,
                    suggestedMax: Math.max(...yVals, ...yPrimeVals, ...yDoublePrimeVals) * 1.2,
                },
            },
        },
    };

    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, config);
}

function calculateAndPlot() {
    const funcExpr = document.getElementById("function").value;
    const firstDerivative = calculateManualDerivative(funcExpr);
    const secondDerivative = calculateManualDerivative(firstDerivative);

    document.getElementById("original").textContent = "Original Function: " + funcExpr;
    document.getElementById("first").textContent = "First Derivative: " + firstDerivative;
    document.getElementById("second").textContent = "Second Derivative: " + secondDerivative;

    generateGraph(funcExpr, firstDerivative, secondDerivative);
}
