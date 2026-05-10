from flask import Blueprint, request, jsonify
from services.ai_service import generate_camp_activity

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    user_message = data.get("message")

    if not user_message:
        return jsonify({
            "error": "Message is required"
        }), 400

    try:
        response = generate_camp_activity(user_message)

        if isinstance(response, dict):
            return jsonify(response)

        return jsonify({
            "response": response
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
    
