function RobotMazeInterface(robot,maze,selector
  ) {
  this.robot = robot;
  this.maze  = maze;
  this.selector = selector;
}

RobotMazeInterface.prototype.canMove = function (x, y, direction) {
  var forwardX, forwardY, forwardDirection;

  if (["north","east","south","west"].indexOf(direction) === -1) {
    return false;
  }

  switch (direction) {
    case "north":
      forwardX = x;
      forwardY = y+1;
      forwardDirection = "south";
      break;
    case "east":
      forwardX = x+1;
      forwardY = y;
      forwardDirection = "west";
      break;
    case "south":
      forwardX = x;
      forwardY = y-1;
      forwardDirection = "north";
      break;
    case "west":
      forwardX = x-1;
      forwardY = y;
      forwardDirection = "east";
      break;
  }

  if (forwardX <= 0 || forwardX > this.maze.width || forwardY <= 0 || forwardY > this.maze.height) {
    return false
  }

  if (this.maze.spaces[x][y][direction]) {
    return false
  }

  if (this.maze.spaces[forwardX][forwardY][forwardDirection]) {
    return false
  }

  return true
}

RobotMazeInterface.prototype.render = function () {
  $(this.selector).empty().append(this.renderMaze(), this.renderControls());
};

RobotMazeInterface.prototype.renderMaze = function () {
  var $maze = $("<div class='maze'>");
  var $mazeRow, $mazeSpace;
  for (var y=this.maze.height; y >= 1; y -=1 ){
    $mazeRow = $('<div class="mazeRow">').appendTo($maze);
    for (var x=1; x <= this.maze.width; x +=1 ){
      $mazeSpace = $('<div class="mazeSpace">').appendTo($mazeRow);
      $mazeSpace.append(this.renderSpace(x,y));
      $mazeSpace.append("&nbsp;")
        .toggleClass('north', !this.canMove(x, y, 'north'))
        .toggleClass('south', !this.canMove(x, y, 'south'))
        .toggleClass('east', !this.canMove(x, y, 'east'))
        .toggleClass('west', !this.canMove(x, y, 'west'));
    }
  }
  return $maze;
}

RobotMazeInterface.prototype.renderSpace = function (x,y) {
  var isRobot = false;
  var isStart = false;
  var isEnd = false;

  if (this.robot !== null && this.robot.x == x && this.robot.y == y) {
      isRobot = true;
  }
  if (this.maze.endX == x && this.maze.endY == y) {
      isEnd = true;
  }
  if (this.maze.startX == x && this.maze.startY == y)  {
      isStart = true;
  }

  if (!isRobot && !isStart && !isEnd) {
    return "";
  }

  var icons = {
    start: "icon-screenshot",
    end: "icon-remove-circle",
    northRobot: "icon-user",
    eastRobot: "icon-user",
    southRobot: "icon-user",
    westRobot: "icon-user",
    northRobotStart: "icon-user",
    eastRobotStart: "icon-user",
    southRobotStart: "icon-user",
    westRobotStart: "icon-user",
    robotEnd: "icon-ok-sign "
  }  
  var $space = $('<i>');

  if (isRobot) {
    $space.addClass("robot");
  }
  if (isStart) {
    $space.addClass("start");
  }
  if (isEnd) {
    $space.addClass("end");
  }

  if (isRobot && isEnd) {
    $space.addClass(icons["robotEnd"]);    
  } else if (isRobot && isStart) {
    $space.addClass(icons[this.robot.orientation + "RobotStart"]);
  } else if (isRobot) {
    $space.addClass(icons[this.robot.orientation + "Robot"]);
  } else if (isEnd) {
    $space.addClass(icons["end"]);        
  } else if (isStart)  {
    $space.addClass(icons["start"]);        
  }  

  return $space;

}

RobotMazeInterface.prototype.renderControls = function () {
  var interface = this;
  if (interface.robot === null) return false;
  var $actions = $("<div class='actions'>");
  

  var buttons = {};
  if(typeof interface.robot.setMaze == 'function') {   
    buttons["Place Robot in Maze"] = function () {
        interface.robot.setMaze(interface.maze);
        interface.render();
      };
  }
  if(typeof interface.robot.exitMazeLeftWall == 'function') {   
    buttons["Follow the Left Wall"] = function () {    
        if (interface.robot.maze == interface.maze) {
          (function callExitMaze(){
              setTimeout(function() {
                  result = interface.robot.exitMazeLeftWall(1);
                  interface.render();
                  if (result === false) {
                      callExitMaze();
                  }
                 return result;
              }, 150);
          })();
        }
      };
  }
  if(typeof interface.robot.exitMazeRightWall == 'function') {   
    buttons["Follow the Right Wall"] = function () {    
        if (interface.robot.maze == interface.maze) {
          (function callExitMaze(){
              setTimeout(function() {
                  result = interface.robot.exitMazeRightWall(1);
                  interface.render();
                  if (result === false) {
                      callExitMaze();
                  }
                 return result;
              }, 150);
          })();
        }
      };
  }

  for (var label in buttons) {
    if (buttons.hasOwnProperty(label)){
      var $btn = $('<a class="btn">')
        .text(label)
        .appendTo($actions)
        .click(buttons[label]);
    }
  }

  if (this.robot.maze != this.maze || (this.maze.endX == this.robot.x && this.maze.endY == this.robot.y)) {
    $robot = $('<i class="robot icon-user"></i>').appendTo($actions);
  }  

  return $actions;
}

