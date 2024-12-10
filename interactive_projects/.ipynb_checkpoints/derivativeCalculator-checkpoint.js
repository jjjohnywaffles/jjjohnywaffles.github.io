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
    // Generate x values from -10 to 10 with finer intervals
    const xVals = Array.from({ length: 401 }, (_, i) => -10 + i * 0.05);

    // Evaluate function and derivatives
    const yVals = evaluateFunction(funcExpr, xVals);
    const yPrimeVals = evaluateFunction(firstDerivative, xVals);
    const yDoublePrimeVals = evaluateFunction(secondDerivative, xVals);

    // Ensure valid y-values and filter NaN or Infinity
    const allYVals = [...yVals, ...yPrimeVals, ...yDoublePrimeVals].filter(
        (val) => isFinite(val)
    );

    const yMin = Math.min(...allYVals);
    const yMax = Math.max(...allYVals);

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
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "x" },
                },
                y: {
                    title: { display: true, text: "y" },
                    min: yMin - Math.abs(yMin * 0.1), // Add buffer below min
                    max: yMax + Math.abs(yMax * 0.1), // Add buffer above max
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
