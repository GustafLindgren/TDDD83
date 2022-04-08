from flask import Flask, request, jsonify, make_response, render_template, Response
from sqlalchemy import asc, desc
from database import db, bcrypt, User, Organisation, Receipt, ShoppingCart, HasOrg, Portfolio, HasOrgPort

import sys
sys.dont_write_bytecode = True #hindrar py cache från att skapas, kan tas bort om det ej behövs för er
                              
import payment
import datetime
from datetime import timedelta
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_jwt_extended.utils import get_jwt_identity

#Har satt client/sites som template folder för att kunna ladda in html-filer
#för stripe
app = Flask(__name__, static_folder='../client', static_url_path='/', template_folder='../client/sites')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['DEBUG'] = True
app.config['JWT_SECRET_KEY'] = "Liberté_égalité_fraternité"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)
db.init_app(app)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# The route that loads the website
@app.route('/')
def client():
  return app.send_static_file('client.html')

#stripe payment route
@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
  return payment.pay_with_stripe()


# Route gets all users or adds a new user
@app.route('/user', methods=['POST'])
def user():
  if request.method == 'POST':
    content = request.get_json()
    if User.query.filter_by(email=content['email']).first() == None:
      user = User(first_name=content['first_name'], last_name=content['last_name'], email=content['email'])
      user.set_password(content['password'])
      db.session.add(user)
      db.session.commit()
      return {'succ': True}
    else:
      return {'succ': False}

  
# Route manages user configuration in the database
@app.route('/user/<string:email>', methods=['GET', 'PUT', 'DELETE'], endpoint='selectUser')
@jwt_required(optional=True)
def selectUser(email):
  if User.query.filter_by(email=get_jwt_identity()).first() != None:
    email = get_jwt_identity()
    if request.method == 'GET':
      return jsonify(User.serialize(User.query.get(email)))
    elif request.method == 'DELETE':
      if User.query.filter_by(email=get_jwt_identity()).first().isAdmin:
        db.session.delete(User.query.get(email))
        db.session.commit()
        return Response(status=200)
      else:
        return Response(status=401)
    elif request.method == 'PUT':
      user = User.query.filter_by(email=get_jwt_identity()).first()
      content = request.get_json()
      password = content.get("password")
      if bcrypt.check_password_hash(user.hashed_pass, password):
        for key in content:
          if hasattr(user, key) and key != 'email':
            setattr(user, key, content[key])
        db.session.commit()
        return Response(status=200)
      else:
        return Response(status=401)
  else:
    abort(404)


# Route returns the receipts from the given user
# Add more information if needed
@app.route('/user/<string:email>/receipts', methods=['GET'])
@jwt_required()
def receipts(email):
  if User.query.filter_by(email=get_jwt_identity()).first() != None:
    email = get_jwt_identity()
    res = []
    for x in Receipt.query.filter_by(user_email=email).order_by(desc(Receipt.receipt_id)).all():
      cart = ShoppingCart.query.filter_by(shopping_id=x.shopping_cart_id).first()
      orgs = []
      for has_org in HasOrg.query.filter_by(shopping_id=x.shopping_cart_id).all():
        org = Organisation.query.filter_by(organisation_id=has_org.organisation_id).first()
        orgs.append({'percent': has_org.percentage, 'name': org.name})
      res.append({'time': x.time_of_purchase, 'cost': cart.summation, 'orgs': orgs})
    return jsonify(res)
  else:
    abort(401)

#login route
@app.route('/login', methods=['POST'])
def login():
  if request.method == 'POST':
    req = request.get_json()
    email = req.get("email")
    password = req.get("password")
    if User.query.filter(User.email == email).all() is not None:
      inlog_user = User.query.filter(User.email == email).first()
      if inlog_user is not None:
        if bcrypt.check_password_hash(inlog_user.hashed_pass, password):
          access_token = create_access_token(identity = inlog_user.email)
          return jsonify({"token": access_token, "user": inlog_user.serialize()})
        else: 
          return jsonify({"msg": "Bad password"}), 401
      else: 
        return jsonify({"msg": "Bad email"}), 401
    else:
      return jsonify({"msg": "Server error"}), 500

#shopping cart gets saved in database
@app.route('/shoppingcart', methods=['POST'])
@jwt_required(optional=True)
def shoppingcart():
  if request.method == 'POST':
    content = request.get_json()
    new_shoppingcart = []
    for items in content:
      new_shoppingcart.append({'name':items['name'], 'percent':items['percent'], 'summation':items['summation']})
    if get_jwt_identity() is not None:
      shoppingcart = ShoppingCart(summation=new_shoppingcart[0]['summation'], user_email=get_jwt_identity())
    else:
      shoppingcart = ShoppingCart(summation=new_shoppingcart[0]['summation'])
    db.session.add(shoppingcart)
    db.session.commit()
    for x in range(len(new_shoppingcart)):
      hasorg = HasOrg(shopping_id=shoppingcart.shopping_id, organisation_id=Organisation.query.filter(Organisation.name == new_shoppingcart[x]['name']).first().organisation_id, percentage=(new_shoppingcart[x]['percent']) / 100)
      db.session.add(hasorg)
      db.session.commit()
    shopping = str(int(shoppingcart.shopping_id))
    data = {
      'data_shopping': shopping,
      'user_email': get_jwt_identity()
    }
    return jsonify(data)

#add organisation, and filter organisations on category
@app.route('/organisation', methods=['GET', 'POST'])
@jwt_required(optional=True)
def organisation():
  if request.method == 'GET':
    list = [{ 'name': 'Djur', 'amount': 0, 'index': 1 }, { 'name': 'Natur', 'amount': 0, 'index': 2 }, { 'name': 'Medicin & Forskning', 'amount': 0, 'index': 3 },
                    { 'name': 'Mental hälsa', 'amount': 0, 'index': 4 }, { 'name': 'Mänskliga rättigheter', 'amount': 0, 'index': 5 }, { 'name': 'Övrigt', 'amount': 0, 'index': 6 }]
    for org in Organisation.query.all():
      if org.active:
        list[org.category - 1]['amount'] += 1
    return {'categories': list}
  elif request.method == 'POST':
    if User.query.filter_by(email=get_jwt_identity()).first().isAdmin:
      content = request.get_json()
      if Organisation.query.filter_by(name=content['orgName']).first() == None:
        organisation = Organisation(name=content['orgName'], selector_name=content['orgSelectorName'], logo=content['orgLogo'], short_info=content['orgInfoShort'], 
                                    long_info=content['orgInfoLong'], url=content['orgUrl'], category=content['category'])
        db.session.add(organisation)
        db.session.commit()
        return {'succ': True}
      else:
        return {'succ': False}
    else:
      return Response(status=401)

#returns organisations based on which page user is on
@app.route('/organisation/page/<int:page>', methods=['POST'])
def organisation_page(page):
  if request.method == 'POST':
    organisation_list = []
    index = 10
    for org in Organisation.query.order_by(Organisation.name).all():
      if request.get_json()['category'][org.category - 1] and org.active:
        if (index // 10 == page):
          organisation_list.append(Organisation.serialize(org))
        index += 1
    return jsonify({'total_amount': index - 10, 'orgs': organisation_list})

#modify organisation info or delete
@app.route('/organisation/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def put_delete_org(id): 
  if (User.query.filter_by(email=get_jwt_identity()).first().is_admin):
    org = Organisation.query.filter_by(organisation_id=id).first()
    if request.method == 'PUT':
      org.name = request.get_json()['changeName']
      org.selector_name = request.get_json()['orgSelectorName']
      org.logo = request.get_json()["orgLogo"]
      org.short_info = request.get_json()["orgInfoShort"]
      org.info_long = request.get_json()["orgInfoLong"]
      org.url = request.get_json()["orgUrl"]
      org.category = request.get_json()["category"]
      db.session.commit()
      return jsonify(org.serialize())
    elif request.method == 'DELETE':
      org.active = False
      db.session.commit()
      return jsonify(org.serialize())      
    else:
      return Response(status=403)

#get a specific organisation by id
@app.route('/organisation/<int:id>', methods=['GET'])
def get_org(id):
  if request.method == 'GET':
    organisation_list = []
    org = Organisation.query.filter_by(organisation_id=id).first()
    return jsonify(org.serialize()) 
  else:
    return Response(status=403)

#get all pre-made portfolios
@app.route('/portfolio', methods=['GET'])
def portfolio():
  if request.method == 'GET':
    portfolio_list = []
    ports = []
    for x in Portfolio.query.all():
      #ports.append(Portfolio.serialize(x))
      #portfolio_list.append(Portfolio.serialize(x))
      orgs = []
      for has_org_port in HasOrgPort.query.filter_by(portfolio_id=x.portfolio_id).all():
        org = Organisation.query.filter_by(organisation_id=has_org_port.organisation_id).first()
        orgs.append({'id' : org.organisation_id, 'name': org.name, 'short_info': org.short_info, 'logo': org.logo})
      portfolio_list.append({'ports': Portfolio.serialize(x), 'orgs': orgs})
    return jsonify(portfolio_list)
  else:
    abort(401)


#webhook for stripe purchase
@app.route('/webhook', methods=['POST'])
def webhook():
  return payment.confirm_purchase()

#change password route
@app.route('/user/<string:email>/changepass', methods=['PUT'])
@jwt_required()
def change_pass(email):
  if request.method == 'PUT':
    content = request.get_json()
    currentPassword = content.get("currentPassword")
    inlog_user = User.query.filter_by(email=get_jwt_identity()).first()
    if bcrypt.check_password_hash(inlog_user.hashed_pass, currentPassword):
      user = User.query.get(get_jwt_identity())
      user.set_password(content['password'])
      db.session.commit()
      
      return {'success': True}
    else:
      return {'success': False}

if __name__ == '__main__':
  app.run(debug=True, port=5006)
