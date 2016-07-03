var chessApp = angular.module('chessApp', []).controller('chessAppController', 
	function($scope,$http) {
		/*Scope Variables*/
		$scope.moves = new Array();
		$scope.isWhiteTurn;
		$scope.legalMoves
		$scope.rootURL = 'http://127.0.0.1:5000/'
		/*Scope Variables*/
		
		/*Scope Functions*/
		$scope.init = function()
		{
			$scope.newGame();
			$scope.setTurn('white');
		};
		
		$scope.setTurn = function(color)
		{
			if(color=='white')
			{
				$("[color='black']").attr("draggable", "false");
				$("[color='white']").attr("draggable", "true");
				$scope.isWhiteTurn = true;
			}
			else if (color=='black')
			{
				$("[color='white']").attr("draggable", "false");
				$("[color='black']").attr("draggable", "true");
				$scope.isWhiteTurn = false;
			}
		};
		
		$scope.switchTurn = function()
		{
			if($scope.isWhiteTurn)
				$scope.setTurn('black');
			else
				$scope.setTurn('white');
		};
		
		$scope.undo = function()
		{
			var url = $scope.rootURL + 'undo';
			$http({
				method: 'POST',
				url: url
			}).then(function successCallback(response)
			{
				if($scope.moves.length > 0)
				{
					var lastMove = $scope.moves.pop();
					console.log(lastMove)
					if(lastMove.wksc)
						$scope.undoWhiteKingsideCastle();
					else if(lastMove.wqsc)
						$scope.undoWhiteQueensideCastle();
					else
					{
						document.getElementById(lastMove.from).appendChild(lastMove.moved);
						if(lastMove.captured != null)
							document.getElementById(lastMove.to).appendChild(lastMove.captured);
					}
					if($scope.isWhiteTurn)
						$scope.setTurn('black');
					else
						$scope.setTurn('white');
				}
				$scope.getLegalMoves();
			}, function errorCallback(response) 
			{
				console.log('ERROR');
				console.log(response);
			});
		};
		
		$scope.isEven = function(n)
		{
			return (n%2)==0;
		};
		
		$scope.isLastCol = function(n)
		{
			return (n%8)==0;
		};
		
		$scope.toLetter = function(n)
		{
			if(n == 1)
				return 'a';
			else if(n == 2)
				return 'b';
			else if(n == 3)
				return 'c';
			else if(n == 4)
				return 'd';
			else if(n == 5)
				return 'e';
			else if(n == 6)
				return 'f';
			else if(n == 7)
				return 'g';
			else
				return 'h';
		};

		//takes the piece and the square and forms the correct chess notation for the move
		$scope.toNotation = function(piece,to,from,captured)
		{
			var result = "";
			var pieceName = piece.id.substring(0,piece.id.indexOf("-"));
			if(pieceName == "bishop")
				result += "B";
			else if(pieceName == "knight")
				result += "N";
			else if(pieceName == "rook")
				result += "R";
			else if(pieceName == "queen")
				result += "Q";
			else if(pieceName == "king")
				result += "K";

			if(captured !== undefined && captured != null)
			{
				if(pieceName == "pawn")
				{
					result += from.substring(0,1);
				}
				result += "x"
			}

			result += to;

			return result;
		};

		$scope.displayTurn = function(index)
		{
			if(index % 2 == 0)
				return ((index/2)+1)+". ";
			else
				return "";
		};

		$scope.handleDrop = function(ev,square)
		{
		    var piece = document.getElementById(ev.dataTransfer.getData("text"));
		    var captured = square.children[0];
		    var to = square.id;
		    var from = piece.parentElement.id;
			var uci = from + to;
		    if($scope.isLegalMove(uci))
		    {
				var url = $scope.rootURL + 'move/' + uci
				$http({
					method: 'POST',
					url: url
				}).then(function successCallback(response) 
				{						
					/*handle castling*/
					if($scope.legalMoves.kingside && uci == 'e1g1')
						$scope.makeWhiteKingsideCastle();
					else if($scope.legalMoves.queenside && uci == 'e1c1')
						$scope.makeWhiteQueensideCastle();
					else if($scope.legalMoves.kingside && uci == 'e8g8')
						console.log('BLACK KINGSIDE CASTLE YALL');
					else if($scope.legalMoves.queenside && uci == 'e8c8')
						console.log('BLACK QUEENSIDE CASTLE YALL');
					else
						$scope.makeMove(square,piece,captured,from,to,false,false);
				}, function errorCallback(response) 
				{
					console.log('ERROR');
					console.log(response);
				});
			}
		};
		
		//handles all functionality for making a standard move
		$scope.makeMove = function(square,moved,captured,from,to,wksc,wqsc)
		{
			//move the pieces
			$scope.movePiece(moved,square);
			
			//push move onto the stack
			var notation = $scope.toNotation(moved,to,from,captured);
			$scope.pushMove(moved,captured,from,to,notation,wksc,wqsc);
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
		};
		
		//moves piece to given square
		$scope.movePiece = function(piece,to)
		{
			var captured = to.children[0];
			if(captured != null)
				to.removeChild(captured);
			to.appendChild(piece);
		};
		
		$scope.pushMove = function(moved,captured,from,to,notation,wksc,wqsc)
		{
			var move = {notation:notation, moved:moved, captured:captured, to:to, from:from, wksc:wksc, wqsc:wqsc};
			$scope.moves.push(move);
		};
				
		$scope.makeWhiteKingsideCastle = function(moved,captured,to,from)
		{
			//move king
			var king = document.getElementById('king-e1');
			var kingTo = document.getElementById('g1');
			$scope.movePiece(king,kingTo);
			
			//move rook
			var rook = document.getElementById('rook-h1');
			var rookTo = document.getElementById('f1');
			$scope.movePiece(rook,rookTo);
			
			//pushing move to stack
			$scope.pushMove(king,null,'e1','g1','0-0',true);
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
		};
		
		$scope.undoWhiteKingsideCastle = function()
		{
			//move king back
			var king = document.getElementById('king-e1');
			var kingTo = document.getElementById('e1');
			$scope.movePiece(king,kingTo);
			
			//move rook back
			var rook = document.getElementById('rook-h1');
			var rookTo = document.getElementById('h1');
			$scope.movePiece(rook,rookTo);
		};
		
		$scope.makeWhiteQueensideCastle = function()
		{
			//move king
			var king = document.getElementById('king-e1');
			var kingTo = document.getElementById('c1');
			$scope.movePiece(king,kingTo);
			
			//move rook
			var rook = document.getElementById('rook-a1');
			var rookTo = document.getElementById('d1');
			$scope.movePiece(rook,rookTo);
			
			//pushing move to stack
			$scope.pushMove(king,null,'e1','c1','0-0-0',false,true);
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
		};
		
		$scope.undoWhiteQueensideCastle = function()
		{
			//move king back
			var king = document.getElementById('king-e1');
			var kingTo = document.getElementById('e1');
			$scope.movePiece(king,kingTo);
			
			//move rook back
			var rook = document.getElementById('rook-a1');
			var rookTo = document.getElementById('a1');
			$scope.movePiece(rook,rookTo);
		};
		
		$scope.getLegalMoves = function()
		{
			var url = 'http://127.0.0.1:5000/legal_moves';
			$http({
			  method: 'GET',
			  url: url
			}).then(function successCallback(response) {
				$scope.legalMoves = response.data;
			  }, function errorCallback(response) {
				console.log('ERROR');
				console.log(response);
			  });
		};
	
		$scope.isLegalMove = function(uci)
		{
			for(var i = 0; i < $scope.legalMoves.len; i++)
			{
				if($scope.legalMoves[i] == uci)
					return true;
			}
			return false;
		};
		
		$scope.newGame = function()
		{
			var url = $scope.rootURL + 'init'
			$http({
				method: 'POST',
				url: url
			}).then(function successCallback(response)
			{
				console.log('New game created');
				$scope.getLegalMoves();
			}, function errorCallback(response) 
			{
				console.log('ERROR');
				console.log(response);
			});
		};
		
		/*Scope Functions*/
		
		$scope.init()
	}
).directive('moveable', 
	function($document){
  		return function(scope, element, attr){
	    	var startX = 0, startY = 0, x = 0, y = 0;
	    	element.css({
			    position: 'relative',
			   	cursor: 'pointer',
			   	display: 'block'
		    });
		    element.on('dragstart', function(event){
		  		event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData("text", event.target.id);
		    });
		};
	}
).directive('droppable',
	function($document){
		return function(scope,element,attr){
			element.on('dragover',function(event)
			{
				if(event.preventDefault)
					event.preventDefault();
			});
			element.on('drop', function(event){
				scope.handleDrop(event,this);
		    });
		}
	}
);

chessApp.config(['$httpProvider',function ($httpProvider) {
	$httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);