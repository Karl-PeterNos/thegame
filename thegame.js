if (Meteor.isClient) {

  hand = new Mongo.Collection(null);
  cheat = new Mongo.Collection(null);
  var stapelIndex = 0;
  var stapel = new Array(99);


  Template.thegame.onCreated(function(){
    Session.set('firstLower',1);
    Session.set('secondLower',1);
    Session.set('firstUpper',100);
    Session.set('secondUpper',100);
  });

  Template.thegame.helpers({
    firstLower: function(){
      return Session.get('firstLower');
    },
    secondLower: function(){
      return Session.get('secondLower');
    },
    firstUpper: function(){
      return Session.get('firstUpper');
    },
    secondUpper: function(){
      return Session.get('secondUpper');
    },
    hand: function(){
      return hand.find({},{sort: {card:1}});
    },
    cheat: function(){
      return cheat.find();
    },
  });


  Template.thegame.events({
    'click .startGame': function () {
      cheat.remove({});
      hand.remove({});
      for(i=0;i<98;i++){
        stapel[i] = i+2;
        cheat.insert({card:i+2});
      }
      for(i=0;i<98;i++){
        j = Math.floor(Math.random()*(98-i))+i;
        k = stapel[j];
        stapel[j]=stapel[i];
        stapel[i]=k;
      }
      stapelIndex = 0;

      Session.set('firstLower',1);
      Session.set('secondLower',1);
      Session.set('firstUpper',100);
      Session.set('secondUpper',100);
    },

    'click .addCards': function () {
      r = hand.find().count();
      if(r<5){
        r = 7-r;
        for(i=0;i<r;i++){
          hand.insert({card:stapel[stapelIndex]});
          if(stapelIndex<98)
            stapelIndex++;
        }
      }
    },

    'click .addFirstLower': function(){
      if( hand.findOne({_id:this._id}).card> Session.get('firstLower')
        ||hand.findOne({_id:this._id}).card==Session.get('firstLower')-10){
          Session.set('firstLower',hand.findOne({_id:this._id}).card);
          cheat.remove({card:hand.findOne({_id:this._id}).card});
          hand.remove({_id:this._id});
        }
    },

    'click .addSecondLower': function(){
      if( hand.findOne({_id:this._id}).card> Session.get('secondLower')
        ||hand.findOne({_id:this._id}).card==Session.get('secondLower')-10){
          Session.set('secondLower',hand.findOne({_id:this._id}).card);
          cheat.remove({card:hand.findOne({_id:this._id}).card});
          hand.remove({_id:this._id});
        }
    },

    'click .addFirstUpper': function(){
      if( hand.findOne({_id:this._id}).card< Session.get('firstUpper')
        ||hand.findOne({_id:this._id}).card==Session.get('firstUpper')+10){
          Session.set('firstUpper',hand.findOne({_id:this._id}).card);
          cheat.remove({card:hand.findOne({_id:this._id}).card});
          hand.remove({_id:this._id});
        }
    },

    'click .addSecondUpper': function(){
      if( hand.findOne({_id:this._id}).card< Session.get('secondUpper')
        ||hand.findOne({_id:this._id}).card==Session.get('secondUpper')+10){
          Session.set('secondUpper',hand.findOne({_id:this._id}).card);
          cheat.remove({card:hand.findOne({_id:this._id}).card});
          hand.remove({_id:this._id});
        }
    }

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
