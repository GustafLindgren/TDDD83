# This file should contain methods that handle transactions
from flask import Flask, request, jsonify, make_response, request
from database import db, bcrypt, User, Organisation, Receipt, ShoppingCart, HasOrg
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_jwt_extended.utils import get_jwt_identity
import stripe
import json
import datetime
#Albins hemliga stripe API-key lol
stripe.api_key = 'sk_test_51IVAyLKv6YL9a0jeIWtkwtBj3D97wew5cuPA38FxqBB4RlsS49jIhBeydYrk5qFElUjIK1fvXl4MxED2wK4s6mju00ibhiuUXx'
endpoint_secret = 'whsec_pBcZcPveG4JbdGtV6g0rFv9xZYNrB7g8'

def calculate_order_amount(data):
  #Converts from string to int and adds two decimals
  return int(float(data) * 100)

#Handling stripe through their API, sends in amount from checkout and creates a
#checkout session where the user pays in and then redirects forward.
def pay_with_stripe():
  try:
    data = json.loads(request.data)
    intent = stripe.PaymentIntent.create(amount=calculate_order_amount(data['amount']),
      currency='sek',
      metadata={
        'shopping_id': data['shopping_id'],
        'user_email': data['user_email']
      })
    return jsonify({
      'clientSecret' : intent['client_secret']
    })
  except Exception as e:
    return jsonify(error=str(e)), 403


def confirm_purchase():
  event = None
  payload = request.data
  try:
      event = json.loads(payload)
  except:
      print('⚠️  Webhook error while parsing basic request.' + str(e))
      return jsonify(success=False)
  if endpoint_secret:
      # Only verify the event if there is an endpoint secret defined
      # Otherwise use the basic event deserialized with json
      sig_header = request.headers.get('stripe-signature')
      try:
          event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
      except stripe.error.SignatureVerificationError as e:
          print('⚠️  Webhook signature verification failed.' + str(e))
          return jsonify(success=False)
  # Handle the event
  if event and event['type'] == 'payment_intent.succeeded':
      payment_intent = event['data']['object']  # contains a stripe.PaymentIntent
      print('Payment for {} succeeded'.format(payment_intent['amount']))
      fulfill_order(payment_intent)
  else:
      # Unexpected event type
      print('Unhandled event type {}'.format(event['type']))
  return jsonify(success=True)


def fulfill_order(payment_intent):
  shopping_id = int(payment_intent.metadata['shopping_id'])
  # Checks if email exists, earlier we put the metadata as "no :(" if it didn't exist because the metadata can't be null
  if payment_intent.metadata['user_email'] != "no :(":
    receipt = Receipt(time_of_purchase=datetime.datetime.now(), user_email=payment_intent.metadata['user_email'], shopping_cart_id = shopping_id)
    db.session.add(receipt)
    db.session.commit()
  else:
    receipt = Receipt(time_of_purchase=datetime.datetime.now(), shopping_cart_id = shopping_id)
    db.session.add(receipt)
    db.session.commit()