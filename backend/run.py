from app import create_app, db
from flask_cors import CORS
from dotenv import load_dotenv
from routes.chatbot import chatbot_bp

load_dotenv()

app = create_app()

CORS(app)

# Register chatbot routes
app.register_blueprint(
    chatbot_bp,
    url_prefix="/api/chatbot"
)

@app.route("/")
def home():
    return {
        "message": "CampMondo Backend Running"
    }
if __name__ == "__main__":

    with app.app_context():
        db.create_all()

    app.run(debug=True, host="127.0.0.1", port=5000)
