from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('login.html')

@app.route('/contact')
def contact():
    return render_template('game.html')

@app.route('/game')
def game():
    return render_template('gameover.html')

if __name__ == '__main__':
    app.run(debug=True)

