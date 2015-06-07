if (Meteor.isClient) {

  hand = new Mongo.Collection(null);
  cheat = new Mongo.Collection(null);
  discard = new Mongo.Collection(null);
  statistic = new Mongo.Collection(null);
  statisticA = new Mongo.Collection(null);
  var stapel = new Array(99);

  handR = new Mongo.Collection(null);
  cheatR = new Mongo.Collection(null);
  discardR = new Mongo.Collection(null);

  function startGame(){

    var i = 0;
    cheat.remove({});
    hand.remove({});
    discard.remove({});

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
  }

  function doAutoPlay(){

    while(findMove()>0){
      move = findBestNaive();
      if(move.tableCard!=''){
        Session.set('activeCard',move.tableCard);
        addHandCard(move.handCard);
      }else{
        addCards();
      }
    }
  }

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
      discard.insert({card:activeCard});
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
      discard.insert({card:handCard});
      cheat.remove({card:handCard});
      hand.remove({card:handCard});
      Session.set('activeCard','');
      return;
    }
  }

  function findMove(){
    var hc = hand.find().count();

    for(i=0;i<hc;i++){
      var cc = hand.find().fetch()[i].card;

      if(cc>Session.get('firstLower')||(cc+10)==Session.get('firstLower')){
        return cc;
      }else if(cc>Session.get('secondLower')||(cc+10)==Session.get('secondLower')) {
        return cc;
      }else if(cc<Session.get('firstUpper')||(cc-10)==Session.get('firstUpper')) {
        return cc;
      }else if(cc<Session.get('secondUpper')||(cc-10)==Session.get('secondUpper')) {
        return cc;
      }
    }
    return 0;
  }

  function findBestNaive(){
    var hc = hand.find().count();
    var deltaMin = 100;
    var r = {handCard:0, tableCard:'', text:''};

    if (((98-Session.get('stapelIndex'))>0)&&(hc<=(Session.get("drawMax")-Session.get("playMin")))){
      r.text = "Draw";
      return r;
    }

    for(i=0;i<hc;i++){
      var cc = hand.find().fetch()[i].card;
      if((cc+10)==Session.get('firstLower')){
        r.handCard = cc;
        r.tableCard = 'firstLower';
        r.text = cc+" to "+Session.get(r.tableCard);
        return r;
      }else if((cc+10)==Session.get('secondLower')){
        r.handCard = cc;
        r.tableCard = 'secondLower';
        r.text = cc+" to "+Session.get(r.tableCard);
        return r;
      }else if((cc-10)==Session.get('firstUpper')){
        r.handCard = cc;
        r.tableCard = 'firstUpper';
        r.text = cc+" to "+Session.get(r.tableCard);
        return r;
      }else if((cc-10)==Session.get('secondUpper')){
        r.handCard = cc;
        r.tableCard = 'secondUpper';
        r.text = cc+" to "+Session.get(r.tableCard);
        return r;
      }

      if((cc>Session.get('firstLower'))&&((cc-Session.get('firstLower'))<deltaMin)){
        r.handCard = cc;
        for(j=i+1;j<hc;j++){
          if(hand.find().fetch()[j].card==(r.handCard+10)){
            r.handCard = hand.find().fetch()[j].card;
          }
        }
        r.tableCard = 'firstLower';
        r.text = r.handCard+" to "+Session.get(r.tableCard);
        deltaMin = cc-Session.get('firstLower');
      }
      if((cc>Session.get('secondLower'))&&((cc-Session.get('secondLower'))<deltaMin)){
        r.handCard = cc;
        for(j=i+1;j<hc;j++){
          if(hand.find().fetch()[j].card==(r.handCard+10)){
            r.handCard = hand.find().fetch()[j].card;
          }
        }
        r.tableCard = 'secondLower';
        r.text = r.handCard+" to "+Session.get(r.tableCard);
        deltaMin = cc-Session.get('secondLower');
      }
      if((cc<Session.get('firstUpper'))&&((Session.get('firstUpper')-cc)<deltaMin)){
        r.handCard = cc;
        for(j=i-1;j>=0;j--){
          if(hand.find().fetch()[j].card==(r.handCard-10)){
            r.handCard = hand.find().fetch()[j].card;
          }
        }
        r.tableCard = 'firstUpper';
        r.text = r.handCard+" to "+Session.get(r.tableCard);
        deltaMin = Session.get('firstUpper')-cc;
      }
      if((cc<Session.get('secondUpper'))&&((Session.get('secondUpper')-cc)<deltaMin)){
        r.handCard = cc;
        for(j=i-1;j>=0;j--){
          if(hand.find().fetch()[j].card==(r.handCard-10)){
            r.handCard = hand.find().fetch()[j].card;
          }
        }
        r.tableCard = 'secondUpper';
        r.text = r.handCard+" to "+Session.get(r.tableCard);
        deltaMin = Session.get('secondUpper')-cc;
      }
    }



    if(deltaMin==100)
      r.text = "No more moves";
    return r;
  }

  function addCards(){
    r = hand.find().count();
    if(r<=(Session.get("drawMax")-Session.get("playMin"))){
      r = Session.get("drawMax")-r;
      var si = Session.get('stapelIndex');
      for(i=0;i<r;i++){
        hand.insert({card:stapel[si]});
        if(si<98)
          si++;
      }
      Session.set('stapelIndex',si);

      if(!(Session.get('inAutoGame'))){
        handR.remove({});
        cheatR.remove({});
        discardR.remove({});
        hand.find().forEach(function(doc){handR.insert(doc)});
        cheat.find().forEach(function(doc){cheatR.insert(doc)});
        discard.find().forEach(function(doc){discardR.insert(doc)});
        Session.set('firstLowerR',Session.get('firstLower'));
        Session.set('secondLowerR',Session.get('secondLower'));
        Session.set('firstUpperR',Session.get('firstUpper'));
        Session.set('secondUpperR',Session.get('secondUpper'));
        Session.set('stapelIndexR',Session.get('stapelIndex'));
      }
    }
  }

  Template.thegame.onCreated(function(){
    Session.set('playMin',3);
    Session.set('drawMax',7);
    Session.set('autoId','');
    Session.set('inAutoGame',false);
    startGame();
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
        return 'danger';
        return 'warning';
    },
    isActiveHand: function(){
      if(Session.get('activeCard')==hand.findOne({_id:this._id}).card)
        return 'info';
      return 'primary';
    },
    hand: function(){
      return hand.find({},{sort: {card:1}});
    },
    statistic: function(){
      return statistic.find({min:Session.get('playMin'), max:Session.get('drawMax')},{sort: {result:1}});
    },

    cheat: function(){
      return cheat.find();
    },
    addCardsDisabled: function(){
      return (
        (hand.find().count()>(Session.get("drawMax")-(Session.get("playMin"))))
            ||
        ((Session.get('stapelIndex')>97)||(Session.get('stapelIndex')==0))
             );
    },
    remainingStapel: function(){
      var r = 98-Session.get('stapelIndex');
      return r;
    },
    headerContent: function(){
      if((Session.get('stapelIndex')>97)&&(hand.find().count()==0)){
        return "You won a game!";
      }else if((hand.find().count()>4)&&(findMove()==0)) {
        return "You lost a game!";
      }else {
        return "Play a game!"
      }
    },
    isDeltaTen: function(){
      if (  (this.card == Session.get('firstUpper')+10)
          ||(this.card == Session.get('secondUpper')+10)
          ||(this.card == Session.get('firstLower')-10)
          ||(this.card == Session.get('secondLower')-10)
        )
        return true;
      if (hand.findOne({card:this.card+10}))
        return true;
      if (hand.findOne({card:this.card-10}))
        return true;
      return false;
    },
    isDraw: function(handMax){
      if(Session.get('drawMax')==handMax)
        return 'X';
    },
    isMin: function(playMin){
      if(Session.get('playMin')==playMin)
        return 'X';
    },
    playMin: function(){
      return Session.get('playMin');
    },
    drawMax: function(){
      return Session.get('drawMax');
    },
    isAuto: function(){
      if(Session.get('autoId'))
        return 'X';
    },
    showProposal: function(){
      return findBestNaive().text;
    },
    autoPlayCount: function(){
      if(statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}))
        return statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}).countGame;
        return 0;
    },
    autoPlayWonCount: function(){
      if(statistic.findOne({result:0, min:Session.get('playMin'), max:Session.get('drawMax')}))
        return statistic.findOne({result:0, min:Session.get('playMin'), max:Session.get('drawMax')}).countResult;
      return 0;
    },
    autoPlayWonPct: function(){
      if(statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}))
        return 100*statistic.findOne({result:0, min:Session.get('playMin'), max:Session.get('drawMax')}).countResult/statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}).countGame;
      return 0;
    },
    autoPlayAvg: function(){
      if(statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}))
        return statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}).countPlayed/statisticA.findOne({min:Session.get('playMin'), max:Session.get('drawMax')}).countGame;
      return 0;
    },
    isSimulation: function(){
      return Session.get('simulationMode');      
    }
  });


  Template.thegame.events({
    'click #startGame': function () {
      startGame();
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
    },
    'click #resetHand': function(){
      hand.remove({});
      cheat.remove({});
      handR.find().forEach(function(doc){hand.insert(doc)});
      cheatR.find().forEach(function(doc){cheat.insert(doc)});
      Session.set('firstLower',Session.get('firstLowerR'));
      Session.set('secondLower',Session.get('secondLowerR'));
      Session.set('firstUpper',Session.get('firstUpperR'));
      Session.set('secondUpper',Session.get('secondUpperR'));
      Session.set('stapelIndex',Session.get('stapelIndexR'));
      Session.set('activeCard','');
    },
    'click #setMax7': function(){
      Session.set("drawMax", 7);
    },
    'click #setMax8': function(){
      Session.set("drawMax", 8);
    },
    'click #setMax9': function(){
      Session.set("drawMax", 9);
    },
    'click #setMax10': function(){
      Session.set("drawMax", 10);
    },
    'click #setMax11': function(){
      Session.set("drawMax", 11);
    },
    'click #setMax12': function(){
      Session.set("drawMax", 12);
    },
    'click #setMax13': function(){
      Session.set("drawMax", 13);
    },
    'click #setMax14': function(){
      Session.set("drawMax", 14);
    },
    'click #setMin2': function(){
      Session.set("playMin", 2);
    },
    'click #setMin3': function(){
      Session.set("playMin", 3);
    },
    'click #setMin1': function(){
      Session.set("playMin", 1);
    },
    'click #doAutoMove': function(){
      move = findBestNaive();
      if(move.tableCard!=''){
        Session.set('activeCard',move.tableCard);
        addHandCard(move.handCard);
      }else{
        addCards();
      }
    },
    'click #doAutoPlay': function(){
      if(findMove()==0)
        startGame();
      doAutoPlay();
    },
    'click #doAutoPlayN': function(){

      if(Session.get('autoId')){
        Meteor.clearInterval(Session.get('autoId'));
        Session.set('autoId','');
        return;
      }

      Session.set('autoId',
        Meteor.setInterval(function(){
          if(Session.get("inAutoGame"))
            return;
          Session.set('inAutoGame',true);
          startGame();
          doAutoPlay();
          statistic.upsert({result:98-discard.find().count(), min:Session.get('playMin'), max:Session.get('drawMax')}, {$inc:{countResult:1}});
          statisticA.upsert({min:Session.get('playMin'), max:Session.get('drawMax')}, {$inc:{countGame:1, countPlayed: discard.find().count() }});
          Session.set('inAutoGame',false);
        }, 1));
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
