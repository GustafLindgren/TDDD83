from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash, Bcrypt
db = SQLAlchemy()
bcrypt = Bcrypt()

#TODO: Add serialize that writes out children maybe
class User(db.Model):
  __tablename__ = 'user'
  email = db.Column(db.String, primary_key = True)
  first_name = db.Column(db.String, nullable = False)
  last_name = db.Column(db.String, nullable = False)
  picture = db.Column(db.String, nullable = False, default = 'images/default-profile-picture1.jpg')
  hashed_pass = db.Column(db.String, nullable = False)
  is_admin = db.Column(db.Boolean, nullable = False, default=False)
  receipts = db.relationship('Receipt', backref='user', lazy=True)
  shoppingcarts = db.relationship('ShoppingCart', backref='user', lazy=True)


  def __repr__(self):
    return 'User {}: {} {} {} {}'.format(self.email, self.first_name, self.last_name, self.picture, self.is_admin)

  def serialize(self):
    return dict(email = self.email, first_name = self.first_name, last_name = self.last_name, picture = self.picture, is_admin = self.is_admin)

  def set_password(self, password):
    self.hashed_pass = bcrypt.generate_password_hash(password).decode('utf8')

class ShoppingCart(db.Model):
  __tablename__ = 'shoppingcart'
  shopping_id = db.Column(db.Integer, primary_key = True)
  summation = db.Column(db.Float, nullable = False)
  user_email = db.Column(db.String, db.ForeignKey('user.email', ondelete='SET NULL'), nullable=True)
  receipt = db.relationship('Receipt', backref='shoppingcart', lazy=True)
  has_org = db.relationship('HasOrg', backref='shoppingcart', lazy=True)

  def __repr__(self):
    return 'Shoppingcart {}: {} {}'.format(self.shopping_id, self.summation, self.user_email)

  def serialize(self):
    return dict(shopping_id = self.shopping_id, summation = self.summation, user_email = self.user_email)

class HasOrg(db.Model):
  __tablename__ = 'hasorg'
  shopping_id = db.Column(db.Integer, db.ForeignKey('shoppingcart.shopping_id'), primary_key = True)
  organisation_id = db.Column(db.Integer, db.ForeignKey('organisation.organisation_id'), primary_key = True)
  percentage = db.Column(db.Float, nullable = False)

  def __repr__(self):
    return 'Hasorg: {} {} {}'.format(self.shopping_id, self.organisation_id, self.percentage)

  def serialize(self):
    return dict(shopping_id = self.shopping_id, organisation_id = self.organisation_id, percentage = self.percentage)

class Organisation(db.Model):
  __tablename__ = 'organisation'
  organisation_id = db.Column(db.Integer, primary_key = True)
  name = db.Column(db.String, nullable = False)
  selector_name = db.Column(db.String, nullable = False)
  logo = db.Column(db.String)
  short_info = db.Column(db.String, nullable = False)
  long_info = db.Column(db.String, nullable = False)
  url = db.Column(db.String, nullable = False)
  category = db.Column(db.Integer, nullable= False)
  has_org = db.relationship('HasOrg', backref='organisation', lazy=True)
  has_org_port = db.relationship('HasOrgPort', backref='organisation', lazy=True)
  active = db.Column(db.Boolean, default = True, nullable = False)
# Category är filter till front end, 1= Djur, 2=Natur, 3= Medicin & Forskning,
# 4= Mental hälsa, 5= Mänskliga rättigheter, 6= Övrigt
  def __repr__(self):
    return 'Organisation {}: {} {} {} {} {} {} {}'.format(self.organisation_id, self.name, self.selector_name, self.logo, self.short_info, self.long_info, self.url, self.category)

  def serialize(self):
    return dict(organisation_id = self.organisation_id, name = self.name, selector_name = self.selector_name, logo = self.logo, short_info = self.short_info, long_info = self.long_info, url = self.url, category=self.category)

class Receipt(db.Model):
  __tablename__ = 'receipt'
  receipt_id = db.Column(db.Integer, primary_key = True)
  time_of_purchase = db.Column(db.DateTime, nullable = False)
  user_email = db.Column(db.String, db.ForeignKey('user.email', ondelete='SET NULL'), nullable=True)
  shopping_cart_id = db.Column(db.Integer, db.ForeignKey('shoppingcart.shopping_id', ondelete='SET NULL'), nullable=False)


  def __repr__(self):
    return 'Receipt {}: {} {} {}'.format(self.receipt_id, self.time_of_purchase, self.user_email, self.shopping_cart_id)

  def serialize(self):
    return dict(receipt_id = self.receipt_id, time_of_purchase = self.time_of_purchase, user_email = self.user_email, shopping_cart_id = self.shopping_cart_id)


class HasOrgPort(db.Model):
  __tablename__ = 'hasorgport'
  portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.portfolio_id'), primary_key = True)
  organisation_id = db.Column(db.Integer, db.ForeignKey('organisation.organisation_id'), primary_key = True)

  def __repr__(self):
    return 'Hasorg: {} {}'.format(self.portfolio_id, self.organisation_id)

  def serialize(self):
    return dict(portfolio_id = self.portfolio_id, organisation_id = self.organisation_id)

class Portfolio(db.Model):
  __tablename__ = 'portfolio'
  portfolio_id = db.Column(db.Integer, primary_key = True)
  name = db.Column(db.String, nullable = False)
  logo = db.Column(db.String)
  short_info = db.Column(db.String, nullable = False)
  has_org_port = db.relationship('HasOrgPort', backref='portfolio', lazy=True)

  def __repr__(self):
    return 'Portfolio {}: {}'.format(self.portfolio_id, self.name, self.logo, self.short_info) 

  def serialize(self):
    return dict(portfolio_id = self.portfolio_id, name = self.name, logo = self.logo, short_info = self.short_info) 

