from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

# Helper functions
def parse_and_split_expression(func_expr):
    terms = func_expr.replace('-', ' - ').replace('+', ' + ').split()
    return terms

def calculate_manual_derivative(func_expr):
    terms = parse_and_split_expression(func_expr)
    derivative_terms = []

    for term in terms:
        term = term.strip()
        if 'x**' in term:  # Handle terms like 3*x**2
            parts = term.split('x**')
            coef = int(parts[0].replace('*', '').strip()) if parts[0].strip() not in ('', '+', '-') else (-1 if parts[0].strip() == '-' else 1)
            power = int(parts[1].strip())
            new_coef = coef * power
            new_power = power - 1
            if new_power == 0:
                derivative_terms.append(f"{new_coef}")
            elif new_power == 1:
                derivative_terms.append(f"{new_coef}*x")
            else:
                derivative_terms.append(f"{new_coef}*x**{new_power}")
        elif 'x' in term:  # Handle terms like 3*x or x
            coef = term.replace('*x', '').strip()
            coef = int(coef) if coef not in ('', '+', '-') else (-1 if coef == '-' else 1)
            derivative_terms.append(f"{coef}")
        elif term not in ('+', '-'):  # Constant term, derivative is 0
            continue

    return ' + '.join(derivative_terms).replace('+ -', '- ') if derivative_terms else '0'

def evaluate_function(func_expr, x_vals):
    try:
        constant_value = float(func_expr)
        return np.full_like(x_vals, constant_value, dtype=float)
    except ValueError:
        func_expr = func_expr.replace('x', '(x_vals)')
        return eval(func_expr, {"np": np, "x_vals": x_vals})

@app.route('/calculate-derivative', methods=['POST'])
def calculate_derivative():
    data = request.json
    func_expr = data.get('function', '')

    try:
        first_derivative = calculate_manual_derivative(func_expr)
        second_derivative = calculate_manual_derivative(first_derivative)

        x_vals = np.linspace(-10, 10, 500)
        y_vals = evaluate_function(func_expr, x_vals)
        y_prime_vals = evaluate_function(first_derivative, x_vals)
        y_double_prime_vals = evaluate_function(second_derivative, x_vals)

        return jsonify({
            "original": func_expr,
            "first": first_derivative,
            "second": second_derivative,
            "graph": {
                "x": x_vals.tolist(),
                "y": y_vals.tolist(),
                "yPrime": y_prime_vals.tolist(),
                "yDoublePrime": y_double_prime_vals.tolist()
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
