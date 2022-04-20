# flask app framework
from flask import Flask, render_template, request
import os

HOST = 'localhost'
PORT = 7888
###################################################
#  Flask config 								  #
###################################################
app = Flask(__name__, static_folder='static')
# Set the secret key to some random bytes.
app.secret_key = os.urandom(32)

ques_dic = {}

###################################################
#  Website										  #
###################################################
# Landing page
@app.route("/", methods=['GET', 'POST'])
def index():
	return render_template('index.html')

@app.route("/feedback", methods=["POST"])
def feedback():
    """post feedback content
        Content-Type : application/json
        body:
        content: feedback content
    """
    data = request.get_json()
    #data = request.data
    print (data)
    if data:
        content = data['content']
        year = str(data['year'])
        month = str(data['month'])
        day = str(data['day'])
        hours = str(data['hours'])
        minutes = str(data['minutes'])
        seconds = str(data['seconds'])
        with open("/var/www/html/exaqt/feedback/feedback.txt", "a") as f:
            f.write(year + ":" + month + ":" + day + ":" + hours + ":" + minutes + ":" + seconds + "\t" + content + "\n")
        return {"msg": "success", 'code': 200}
    else:
        return {"msg": "Please input your feedback", 'code': 400}

# @app.route("/feedback", methods=["GET"])
# def get_feedback():
#     import os
#     if os.path.exists('/var/www/html/exaqt/feedback/feedback.txt'):
#         with open("/var/www/html/exaqt/feedback.txt", "r") as f:
#             data = f.read()
#         info = data.split("\n")
#         return {"data": info[:-1], "msg": "success", "code": 200}
#     else:
#         return {"data": [], "msg": "success", "code": 200}


#def log_action(session_id, action):
# 	text = str(session_id) + ';' + action
# 	with open('/var/www/html/exaqt/log/log.txt', 'a+') as log:
# 		log.write(text + '\n')
# 		log.close()

###################################################
#  Start the app								  #
###################################################
if __name__ == "__main__":
	app.run(host=HOST, port=PORT)
