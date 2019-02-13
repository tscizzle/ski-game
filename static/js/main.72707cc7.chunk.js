(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{1165:function(t,i,e){},1167:function(t,i,e){"use strict";e.r(i);var s=e(90),r=e.n(s),o=e(474),n=e.n(o),a=(e(480),e(144)),h=e(145),l=e(147),c=e(146),u=e(148),d=e(54),p=e.n(d),g=e(55),y=e.n(g),k=function(t){function i(){var t;return Object(a.a)(this,i),(t=Object(l.a)(this,Object(c.a)(i).call(this,"SkiSlope"))).publicURL=function(t){return"".concat("https://tscizzle.github.io/ski-game").concat(t)},t.smallestAngleDifference=function(t,i){return Math.atan2(Math.sin(t-i),Math.cos(t-i))},t}return Object(u.a)(i,t),Object(h.a)(i,[{key:"preload",value:function(){console.log("HOF"),console.log(this.publicURL("")),console.log("BOOGA"),this.load.image("arrows",this.publicURL("gameAssets/images/racingArrows.png")),this.load.image("skiBody",this.publicURL("gameAssets/images/skiBody.png")),this.load.image("leftSki",this.publicURL("gameAssets/images/leftSki.png")),this.load.image("rightSki",this.publicURL("gameAssets/images/rightSki.png")),this.load.image("snowParticle",this.publicURL("gameAssets/images/snowParticle.png"))}},{key:"create",value:function(){this.slopeSteepness=Math.PI/6,this.slopeDirection=0,this.gravityAccelerationConstant=500,this.previousAngularVelocity=0,this.previousTurnDirection=null,this.previousTiltAmount=0,this.previousTiltDirection=null,this.previousBackCorner=null,this.standingOnSkis=!0,this.refArrows=[this.add.sprite(0,0,"arrows"),this.add.sprite(0,500,"arrows"),this.add.sprite(500,0,"arrows"),this.add.sprite(500,500,"arrows")],p.a.each(this.refArrows,function(t){return t.setScale(.75)}),this.skiBody=this.add.sprite(0,0,"skiBody"),this.leftSki=this.add.sprite(-40,0,"leftSki"),this.rightSki=this.add.sprite(40,0,"rightSki"),this.skiPlayer=this.add.container(250,250,[this.skiBody,this.leftSki,this.rightSki]),this.skiPlayer.setScale(.25),this.physics.world.enable(this.skiPlayer),this.edgeSnowParticles=this.add.particles("snowParticle"),this.edgeSnowEmitter=this.edgeSnowParticles.createEmitter({radial:!1,lifespan:400,blendMode:"ADD",on:!1}),this.cameras.main.setBackgroundColor(15790320),this.cameras.main.startFollow(this.skiPlayer),this.skiTurningCursors=this.input.keyboard.createCursorKeys(),this.skiTiltCursors=this.input.keyboard.addKeys({up:y.a.Input.Keyboard.KeyCodes.W,down:y.a.Input.Keyboard.KeyCodes.S,left:y.a.Input.Keyboard.KeyCodes.A,right:y.a.Input.Keyboard.KeyCodes.D})}},{key:"update",value:function(){var t=Math.PI/70,i=Math.PI/1e3,e=p.a.min([this.previousAngularVelocity+i,t]);this.skiTurningCursors.left.isDown?("right"!==this.previousTurnDirection?(this.skiPlayer.rotation-=e,this.previousAngularVelocity=e):this.previousAngularVelocity=0,this.previousTurnDirection="left"):this.skiTurningCursors.right.isDown?("left"!==this.previousTurnDirection?(this.skiPlayer.rotation+=e,this.previousAngularVelocity=e):this.previousAngularVelocity=0,this.previousTurnDirection="right"):(this.previousAngularVelocity=0,this.previousTurnDirection=null);var s,r=this.previousTiltDirection;this.skiTiltCursors.left.isDown?"right"!==this.previousTiltDirection?(s=p.a.min([this.previousTiltAmount+.05,1]),r="left"):s=p.a.max([this.previousTiltAmount-.05,0]):this.skiTiltCursors.right.isDown&&"left"!==this.previousTiltDirection?(s=p.a.min([this.previousTiltAmount+.05,1]),r="right"):s=p.a.max([this.previousTiltAmount-.05,0]),0===s&&(r=null);var o=1*(1-s)+.8*s;this.leftSki.setScale(o,1),this.rightSki.setScale(o,1),this.previousTiltAmount=s,this.previousTiltDirection=r;var n=Math.sin(this.slopeSteepness),a=p.a.isNull(r)?this.slopeDirection:this.skiPlayer.rotation,h=Math.cos(a-this.slopeDirection),l=this.gravityAccelerationConstant*n*h,c=Math.sin(a)*l,u=-Math.cos(a)*l,d=Math.atan2(this.skiPlayer.body.velocity.x,-this.skiPlayer.body.velocity.y),g=this.skiPlayer.rotation-Math.PI/2,k=this.skiPlayer.rotation+Math.PI/2,m=Math.abs(this.smallestAngleDifference(g,d))<Math.abs(this.smallestAngleDifference(k,d))?g:k,f=Math.cos(d-m),v=this.skiPlayer.body.speed*f,w=-v*(.1+.9*s),S={x:c+Math.sin(m)*w,y:u+-Math.cos(m)*w};this.skiPlayer.body.setAcceleration(S.x,S.y);var A=500*Math.floor(this.skiPlayer.y/500),b=500*Math.floor(this.skiPlayer.x/500);if(this.refArrows[0].x!==b||this.refArrows[0].y!==A){var P=b+500,D=A+500;this.refArrows[0].setPosition(b,A),this.refArrows[1].setPosition(b,D),this.refArrows[2].setPosition(P,A),this.refArrows[3].setPosition(P,D)}var T=1.1*v,M=Math.abs(w),B=M>=100,C=this.edgeSnowEmitter.on;if(B){C||this.edgeSnowEmitter.start();var O=m===g?"left":"right",E="left"===O?this.skiBody.getBottomLeft(null,!0):this.skiBody.getBottomRight(null,!0),x="left"===O?this.skiBody.getTopLeft(null,!0):this.skiBody.getTopRight(null,!0),j=new y.a.Geom.Line(E.x,E.y,x.x,x.y);this.edgeSnowEmitter.setEmitZone({source:j,type:"random"}),this.edgeSnowEmitter.setSpeed(T),this.edgeSnowEmitter.setAngle(-90);var I,K,L=200*Math.floor(M/200);if(L>=1e3?(I=0,K=.25):(I=50*(1-L/1e3),K=L/1e3*.2+.05),I!==this.edgeSnowEmitter.frequency&&(this.edgeSnowEmitter.setFrequency(I),this.edgeSnowEmitter.setScale({start:K,end:0})),this.previousBackCorner){var R=this.add.graphics();R.setDefaultStyles({lineStyle:{width:3,color:13421772}});var U=R.lineBetween(this.previousBackCorner.x,this.previousBackCorner.y,E.x,E.y);this.add.tween({targets:[U],duration:1e3,alpha:0,onComplete:function(){U.destroy(),R.destroy()}})}this.previousBackCorner=E,O===r&&(this.standingOnSkis=!1)}else C&&this.edgeSnowEmitter.stop(),this.previousBackCorner=null;this.standingOnSkis||(this.skiPlayer.body.setVelocity(0),this.skiPlayer.body.setAcceleration(0))}}]),i}(y.a.Scene),m=(e(1165),function(t){function i(){return Object(a.a)(this,i),Object(l.a)(this,Object(c.a)(i).apply(this,arguments))}return Object(u.a)(i,t),Object(h.a)(i,[{key:"componentDidMount",value:function(){!function(){var t={type:y.a.AUTO,width:800,height:800,scene:[k],physics:{default:"arcade"}};new y.a.Game(t)}()}},{key:"render",value:function(){return r.a.createElement("div",{className:"app"})}}]),i}(s.Component));Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));n.a.render(r.a.createElement(m,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(t){t.unregister()})},475:function(t,i,e){t.exports=e(1167)},480:function(t,i,e){}},[[475,2,1]]]);
//# sourceMappingURL=main.72707cc7.chunk.js.map