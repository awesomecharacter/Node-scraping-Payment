var express = require('express');
var router = express.Router();
var google = require('../utils/googlesheet');
var storage = require('../utils/storage');
var scrape = require('../utils/scrape');
const date = require('date-and-time');
const config = require('../config');
var stripe = require('stripe')(config.stripe_secret);


/* GET home page. */
router.get('/', function(req, res, next) {
  var max_userid = storage.getFromStorage('max_userid');
  if(max_userid==null) {
    storage.setInStorage('max_userid', {no: 0});
  }
  google.read_info();
  res.render('index', { title: 'Express' });
});

router.post('/saving_address', function(req, res, next) {
  var address = req.body.street_number + ' ' + req.body.route;
  var {city, state, postal_code, country} = req.body;
  storage.setInStorage('address',{address: address});
  storage.setInStorage('state', {state: state});
  storage.setInStorage('zip', {zip: postal_code});
  storage.setInStorage('city', {city: city});
  res.render('finder');
});

router.post('/saving_detail', async function(req, res, next){
  var {first, last, birth, home_age, alarm_system, roofless, rooftype, havepool, dog, basement, bundlehome, flood, settlementdate} = req.body;
  storage.setInStorage('first',{first: first});
  storage.setInStorage('last',{last: last});
  storage.setInStorage('birth',{birth: birth});
  storage.setInStorage('home_age',{home_age: home_age});
  storage.setInStorage('alarm_system',{alarm_system: alarm_system});
  storage.setInStorage('roofless',{roofless: roofless});
  storage.setInStorage('rooftype',{rooftype: rooftype});
  storage.setInStorage('havepool',{havepool: havepool});
  storage.setInStorage('dog',{dog: dog});
  storage.setInStorage('basement',{basement: basement});
  storage.setInStorage('bundlehome',{bundlehome: bundlehome});
  storage.setInStorage('flood',{flood: flood});
  storage.setInStorage('settlementdate',{settlementdate: settlementdate});
  var address = storage.getFromStorage('address');
  var city = storage.getFromStorage('city');
  var zip = storage.getFromStorage('zip');
  var state = storage.getFromStorage('state');
  var name = first + '' + last + ', ' + birth;
  var bug = {
    name: name,
    address: address.address + ', ' + city.city + ', ' + state.state + ', ' + zip.zip,
    home_age: home_age,
    alarm_system: alarm_system,
    roofless: roofless,
    rooftype: rooftype,
    havepool: havepool,
    dog: dog,
    basement: basement,
    bundlehome: bundlehome,
    flood: flood,
    settlementdate: settlementdate
  };
  console.log(bug);
  var info = await scrape.run(address, city, state, zip, req.body);
  console.log(info);
  res.render('summary', {
    name: name,
    address: address.address + ', ' + city.city + ', ' + state.state + ', ' + zip.zip,
    home_age: home_age,
    alarm_system: alarm_system,
    roofless: roofless,
    rooftype: rooftype,
    havepool: havepool,
    dog: dog,
    basement: basement,
    bundlehome: bundlehome,
    flood: flood,
    settlementdate: settlementdate
  });
});

router.post('/checkout', function(req, res, next) {
  var {ccNumber, expDate, cvc} = req.body;
  console.log(req.body.stripeToken);
  stripe.charges.create({
    // ensures we send a number, and not a string
    amount: 2000,
    currency: config.stripe_ccy,
    source: req.body.stripeToken,
    description: 'Houzioq', // 👈 remember to change this!
    // this metadata object property can hold any
    // extra private meta data (like IP address)
    metadata: {},
  }, function (err, customer) {
    if (err) {
      //var msg = customer.error.message || "unknown";
      res.send("Error while processing your payment ");
    }
    else {
      var id = customer.id;
      console.log('Success! Customer with Stripe ID ' + id + ' just signed up!');
      // save this customer to your database here!
      res.send('ok');
    }
  });
});

router.get('/report', function(req, res, next) {
  res.render('report');
});

router.get('/summary', function(req, res, next) {
  res.render('summary');
});

module.exports = router;
