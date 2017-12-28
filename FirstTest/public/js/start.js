function StartScene(game) {
  this.preload = function(){
    console.log('preload');
  }
  this.create = function(){
    console.log('create');
  }
  this.update = function(){
    console.log('update');
  }
}

module.exports = StartScene;