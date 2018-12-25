var express = require('express');
var router = express.Router();
var storage = require('../utils/storage');
var scrape = require('../utils/scrape');
const date = require('date-and-time');
const config = require('../config');
var stripe = require('stripe')(config.stripe_secret);
var User = require('../models/users');
var Claim = require('../models/claims');
var Order = require('../models/order');
var PDFDocument = require('pdfkit');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/saving_address', function (req, res, next) {
  var address = req.body.street_number + ' ' + req.body.route;
  var { city, state, postal_code, country } = req.body;
  storage.setInStorage('address', { address: address });
  storage.setInStorage('state', { state: state });
  storage.setInStorage('zip', { zip: postal_code });
  storage.setInStorage('city', { city: city });
  res.render('finder');
});

router.post('/saving_detail', async function (req, res, next) {
  var { first, last, birth, email, home_age, alarm_system, roofless, rooftype, havepool, dog, basement, bundlehome, flood, settlementdate } = req.body;
  storage.setInStorage('first', { first: first });
  storage.setInStorage('last', { last: last });
  storage.setInStorage('birth', { birth: birth });
  storage.setInStorage('email', {email: email});
  storage.setInStorage('home_age', { home_age: home_age });
  storage.setInStorage('alarm_system', { alarm_system: alarm_system });
  storage.setInStorage('roofless', { roofless: roofless });
  storage.setInStorage('rooftype', { rooftype: rooftype });
  storage.setInStorage('havepool', { havepool: havepool });
  storage.setInStorage('dog', { dog: dog });
  storage.setInStorage('basement', { basement: basement });
  storage.setInStorage('bundlehome', { bundlehome: bundlehome });
  storage.setInStorage('flood', { flood: flood });
  storage.setInStorage('settlementdate', { settlementdate: settlementdate });
  var address = storage.getFromStorage('address');
  var city = storage.getFromStorage('city');
  var zip = storage.getFromStorage('zip');
  var state = storage.getFromStorage('state');
  User.find({ first: first, last: last, birth: birth }, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('err');
    }
    else {
      if (user.length > 0) {
        console.log(user[0]._id);
        storage.setInStorage('user', { id: user[0]._id })
      }
      else {
        /*------------- Save user -------------------*/
        var user = new User();
        user.first = first;
        user.last = last;
        user.birth = birth;
        user.email = email;
        user.address = address.address;
        user.city = city.city;
        user.state = state.state;
        user.zip = zip.zip;
        user.home_age = home_age;
        user.alarm_system = alarm_system;
        user.roofless = roofless;
        user.rooftype = rooftype;
        user.havepool = havepool;
        user.dog = dog;
        user.basement = basement;
        user.bundlehome = bundlehome;
        user.flood = flood;
        user.settlementdate = settlementdate;
        user.save();
        console.log(user._id);
        storage.setInStorage('user', { id: user._id })
      }
    }
  });

  var name = first + '' + last + ', ' + birth;
  var info = await scrape.run(address, city, state, zip, req.body);
  console.log(info);

  storage.setInStorage('claims', { claims: info });
  console.log("1");
  var user = storage.getFromStorage('user');
  info.claims.forEach(element => {
    Claim.find({
      no: element.losshistory_no,
      loss_date: element.losshistory_date,
      loss_amount: element.losshistory_amount
    }, function(err, claim){
      if(err){
        console.log(err);
        res.render('error');
      }
      if(claim.length == 0){
        var claim = new Claim();
        claim.no = element.losshistory_no;
        claim.loss_date = element.losshistory_date;
        claim.loss_amount = element.losshistory_amount;
        claim.loss_cause = element.losshistory_cause;
        claim.claim_no = element.claim_no;
        claim.claim_status = element.claim_status;
        claim.source = element.source_cd;
        claim.user_id = user.id;
        claim.save();
      }
    });
  });
  console.log("2");
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

router.post('/checkout', function (req, res, next) {
  var { ccNumber, expDate, cvc } = req.body;
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
      res.render('error');
    }
    else {
      var id = customer.id;
      var claim = storage.getFromStorage('claims');
      var claim_score = (claim.claims.length == 0) ? 99 : 49;
      var warning = [];
      warning[0] = (claim.claims.length > 0) ? 1 : 0;
      var dog = storage.getFromStorage('dog');
      warning[1] = (dog.dog == "Yes") ? 1 : 0;
      var rooftype = storage.getFromStorage('rooftype');
      warning[2] = (rooftype.rooftype == "Other") ? 0 : 1;
      var roofless = storage.getFromStorage('roofless');
      warning[3] = (roofless.roofless == "20+ Years" || roofless.roofless == "Unknown") ? 1 : 0;
      var home_age = storage.getFromStorage('home_age');
      console.log('home_age - ' + home_age);
      warning[4] = (home_age.home_age == '99+ Years') ? 1 : 0;
      var havepool = storage.getFromStorage('havepool');
      warning[5] = (havepool.havepool == "Yes") ? 1 : 0
      var warning_sum = warning[0] + warning[0] + warning[1] + warning[2] + warning[3] + warning[4] + warning[5];
      var underwriting_score = 0;
      if (warning_sum == 0) {
        underwriting_score = 99;
      }
      else if (warning_sum == 1) {
        underwriting_score = 85;
      } else if (warning_sum == 2) {
        underwriting_score = 65;
      } else if (warning_sum == 3) {
        underwriting_score = 45;
      } else if (warning_sum == 4) {
        underwriting_score = 25;
      } else
        underwriting_score = 15;
    }
    var basement = storage.getFromStorage('basement');
    var credit_score = 0;
    if (basement.basement == "500-699") {
      credit_score = 25;
    } else if (basement.basement == "700-750") {
      credit_score = 15;
    }
    var bundlehome = storage.getFromStorage('bundlehome');
    var bundle_score = 0;
    if (bundlehome.bundlehome == "No") {
      bundle_score = 12;
    }
    var alert_score = 0;
    if (warning_sum == 1) {
      alert_score = 5;
    }
    else if (warning_sum == 2) {
      alert_score = 15;
    }
    var pricing = 100 - credit_score - bundle_score - alert_score;
    /*---------------Saving order history----------------------*/
    storage.setInStorage('order', { id: req.body.stripeToken });
    var user = storage.getFromStorage('user');
    var order = new Order();
    order.id = req.body.stripeToken;
    order.user_id = user.id;
    order.save();
    // send mail to users which containing order number
    var email = storage.getFromStorage('email');
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey('#');
    const msg = {
      to: email.email,
      from: 'service@houzioq.com',
      subject: 'Order No from Houzioq',
      text: 'Order No from Houzioq',
      html: 'Order No is <br/><strong>' + req.body.stripeToken + '</strong>',
    };
    sgMail.send(msg);

    // save this customer to your database here!
    res.render('report', {
      claim_score: claim_score,
      pricing: pricing,
      underwriting_score: underwriting_score,
      warning: warning,
      claim_count: claim.claims.claims.length,
      est_price: claim.claims.price,
    });
  });
});


router.get('/order', function (req, res, next) {
  res.render('order', {
    'error': ''
  });
});

router.post('/order_detail', function (req, res, next) {
  const { order_no } = req.body;
  var ord, user_info, claims;
  console.log(order_no);
  Order.find({ id: order_no }, (err, order) => {
    if (err) {
      console.log(err);
      res.render('error');
    }
    if (order.length > 0) {
      ord = order[0];
      User.find({ _id: ord.user_id }, (err, user) => {
        if (err) {
          console.log(err);
          res.render('error');
        }
        user_info = user[0];
        Claim.find({ user_id: ord.user_id }, (err, claim) => {
          if (err) {
            console.log(err);
            res.render('error');
          }
          console.log(claim);
          console.log(user_info);
          console.log(ord);
          res.render('order_detail', {
            'order': ord,
            'user': user_info,
            'claims': claim
          });
        })
      })
    }
    else {
      res.render('order', {
        'error': "Order Number is invalid",
      });
    }
  });
});

router.post('/send_request', function(req, res) {
  var {sender_email, realtor_email} = req.body;
  console.log(sender_email);
  res.send({
    'success': 'success'
  });
})

router.get('/view_user', function(req, res) {
  var id = req.query.id;
  console.log(id);
  Claim.find({user_id: id}, function(err, claims) {
    if(err) {
      console.log(err);
      res.render('error');
    }
    if(claims.length > 0) {
      Order.find({_id: id}, function(err, orders){
        if(err){
          console.log(err);
          res.render('error');
        }
        if(orders.length > 0) {
          res.render('view_user', {
            'claims': claims,
            'orders': orders
          });
        }
      });
    }
  });
});

router.get('/admin', function(req, res) {
  User.find({}, function(err, user) {
    if(err){
      console.log(err);
      res.render('error');
    }
    if(user.length > 0) {
      res.render('admin', {
        'users': user
      });
    }
  })
})



router.get('/admin/delete', function(req, res) {
  var {id} = req.body;
  User.findByIdAndDelete({_id: id});
  Claim.findByIdAndDelete({user_id: id});
  Order.findByIdAndDelete({user_id: id});
  res.redirect('/admin');
});


router.get('/pdf', function (req, res) {
  var doc = new PDFDocument({ size: [1200, 1450] });
  let filename = "mine"
  // Stripping special characters
  filename = encodeURIComponent(filename) + '.pdf'
  // Setting response to 'attachment' (download).
  // If you use 'inline' here it will automatically open the PDF
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
  res.setHeader('Content-type', 'application/pdf')

  doc.image('path/pdf-logo.png', 430, 100);
  doc.fontSize(28).text("HOMEOWNER INFORMATION SHARING AGREEMENT", 250, 300);
  doc.fontSize(22).text("I, _________________________ own property _________________________________ .", 150, 450);
  doc.fontSize(22).text("I, _________________________ own property _________________________________ .", 150, 550);
  doc.fontSize(22).text("I, _________________________ own property _________________________________ .", 150, 650);
  doc.fontSize(22).text("I, _________________________ own property _________________________________ .", 150, 680);
  doc.fontSize(22).text("I, _________________________ own property _________________________________ .", 150, 750);
  doc.fontSize(22).text("I, _________________________ own property _________________________________ .", 150, 780);
  doc.pipe(res)
  doc.end()
});



module.exports = router;
