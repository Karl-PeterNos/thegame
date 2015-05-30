if (Meteor.isClient) {

  hand = new Mongo.Collection(null);
  cheat = new Mongo.Collection(null);
  var stapel = new Array(99);

  function addTableCard(tableCard){

    var activeCard = Session.get('activeCard');

    if (activeCard==tableCard){
      Session.set('activeCard','');
      return;
    }else if (activeCard=='') {
      Session.set('activeCard',tableCard);
      return;
    }else if (activeCard=='firstLower'
            ||activeCard=='firstUpper'
            ||activeCard=='secondLower'
            ||activeCard=='secondUpper'){
      Session.set('activeCard',tableCard);
      return;
    }else {
      if(tableCard=='firstLower'||tableCard=='secondLower'){
        if( activeCard<Session.get(tableCard)
          &&activeCard!=Session.get(tableCard)-10)
          return;
      }else{
        if( activeCard>Session.get(tableCard)
          &&activeCard!=Session.get(tableCard)+10)
          return;
      }
      Session.set(tableCard,activeCard);
      cheat.remove({card:activeCard});
      hand.remove({card:activeCard});
      Session.set('activeCard','');
      return;
    }
  }

  function addHandCard(handCard){

    var activeCard = Session.get('activeCard');

    if (activeCard==handCard){
      Session.set('activeCard','');
      return;
    }else if (activeCard=='') {
      Session.set('activeCard',handCard);
      return;
    }else if (activeCard!='firstLower'
            &&activeCard!='firstUpper'
            &&activeCard!='secondLower'
            &&activeCard!='secondUpper'){
      Session.set('activeCard',handCard);
      return;
    }else {
      if(activeCard=='firstLower'||activeCard=='secondLower'){
        if( handCard<Session.get(activeCard)
          &&handCard!=Session.get(activeCard)-10)
          return;
      }else{
        if( handCard>Session.get(activeCard)
          &&handCard!=Session.get(activeCard)+10)
          return;
      }
      Session.set(activeCard,handCard);
      cheat.remove({card:handCard});
      hand.remove({card:handCard});
      Session.set('activeCard','');
      return;
    }
  }

  function addCards(){
    r = hand.find().count();
    if(r<5){
      r = 7-r;
      var si = Session.get('stapelIndex');
      for(i=0;i<r;i++){
        hand.insert({card:stapel[si]});
        if(si<98)
          si++;
      }
      Session.set('stapelIndex',si)
    }
  }

  Template.thegame.onCreated(function(){
    Session.set('firstLower',1);
    Session.set('secondLower',1);
    Session.set('firstUpper',100);
    Session.set('secondUpper',100);
    Session.set('activeCard','');
    Session.set('stapelIndex',0);
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
    isActiveTable: function(card){
      if(Session.get('activeCard')==card)
        return 'active';
    },
    isActiveHand: function(){
      if(Session.get('activeCard')==hand.findOne({_id:this._id}).card)
        return 'active';
    },
    hand: function(){
      return hand.find({},{sort: {card:1}});
    },
    cheat: function(){
      return cheat.find();
    },
    addCardsDisabled: function(){
      return ((hand.find().count()>4)||(Session.get('stapelIndex')>97));
    },
    remainingStapel: function(){
      var r = 98-Session.get('stapelIndex');
      return r;
    }
  });


  Template.thegame.events({
    'click #startGame': function () {
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

      Session.set('firstLower',1);
      Session.set('secondLower',1);
      Session.set('firstUpper',100);
      Session.set('secondUpper',100);
      Session.set('activeCard','');
      Session.set('stapelIndex',0);
      addCards();

    },

    'click #addCards': function () {
      addCards();
    },
    'click #firstLower': function(){
      addTableCard('firstLower');
    },
    'click #secondLower': function(){
      addTableCard('secondLower');
    },
    'click #firstUpper': function(){
      addTableCard('firstUpper');
    },
    'click #secondUpper': function(){
      addTableCard('secondUpper');
    },
    'click #card': function(){
      addHandCard(hand.findOne({_id:this._id}).card);
    }

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
