from flask import Flask, render_template, request,jsonify
from flask_mysqldb import MySQL

app = Flask(__name__)

mysql = MySQL(app)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'sql229*'
app.config['MYSQL_DB'] = 'mydb'




@app.route('/getstockoptions', methods=['GET'])
def index():
 cur=mysql.connection.cursor()
 cur.execute("SELECT * FROM stocklist")
 rv=cur.fetchall()
 
 response = jsonify(rv)

 response.headers.add("Access-Control-Allow-Origin", "*")
 return response


 


#if _name_ == '_main_':
app.run()