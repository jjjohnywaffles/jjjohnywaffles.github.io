function calculateAndPlot() {
    try {
        const funcExpr = document.getElementById("function").value;
        const firstDerivative = calculateManualDerivative(funcExpr);
        const secondDerivative = calculateManualDerivative(firstDerivative);

        // Update Results
        document.getElementById("original").textContent = "Original Function: " + funcExpr;
        document.getElementById("first").textContent = "First Derivative: " + firstDerivative;
        document.getElementById("second").textContent = "Second Derivative: " + secondDerivative;

        generateGraph(funcExpr, firstDerivative, secondDerivative);
    } catch (error) {
        alert("Error in calculation: " + error.message);
    }
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

function parseAndSplitExpression(funcExpr) {
    return funcExpr.replace(/-/g, " - ").replace(/\+/g, " + ").split(" ");
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
    // Generate x values from -10 to 10 with correct step size
    const xVals = Array.from({ length: 401 }, (_, i) => -10 + i * (20 / 400));

    // Evaluate function and derivatives
    const yVals = evaluateFunction(funcExpr, xVals);
    const yPrimeVals = evaluateFunction(firstDerivative, xVals);
    const yDoublePrimeVals = evaluateFunction(secondDerivative, xVals);

    // Filter valid y-values and determine min/max for y-axis
    const allYVals = [...yVals, ...yPrimeVals, ...yDoublePrimeVals].filter((val) => isFinite(val));
    const yMin = Math.min(...allYVals) - Math.abs(Math.min(...allYVals) * 0.1);
    const yMax = Math.max(...allYVals) + Math.abs(Math.max(...allYVals) * 0.1);

    // Configure Chart.js graph
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
                    tension: 0.1,
                    pointRadius: 0,
                },
                {
                    label: "f'(x)",
                    data: yPrimeVals,
                    borderColor: "orange",
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                },
                {
                    label: "f''(x)",
                    data: yDoublePrimeVals,
                    borderColor: "green",
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "x" } },
                y: { title: { display: true, text: "y" }, min: yMin, max: yMax },
            },
        },
    };

    // Destroy old chart if it exists, and create a new one
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, config);
}