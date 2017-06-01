/*TODO
 * - change make move to a GET http call and return object of special moves
 *		{wksc:boolean,wqsc:boolean,bksc:boolean,bqsc:boolean,enPassant:String{('None' or '*en passant square*')}
 * - implement en passant functionality
 *		- make notation work
 * - implement end of game detection: no legal moves, x3 repeated position, no legal moves, checkmate
 * - create new game without having to refresh the page
 * - add AI to play against
 */ 
var chessApp = angular.module('chessApp', []).controller('chessAppController', 
	function($scope,$http,$timeout,$compile) {
		/*Scope Variables*/
		$scope.moves = new Array();
		$scope.isWhiteTurn = true;
		$scope.legalMoves
		$scope.rootURL = 'http://127.0.0.1:5000/'
		$scope.promotionMove;
		$scope.fileMap = {'a':1,'b':2,'c':3,'d':4,'e':5,'f':6,'g':7,'h':8,1:'a',2:'b',3:'c',4:'d',5:'e',6:'f',7:'g',8:'h'};
		$scope.calculatingMove;
		/*Scope Variables*/
		
		/*Scope Functions*/
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
			if($scope.moves.length > 0)
			{
				var url = $scope.rootURL + 'undo';
				$http({
					method: 'POST',
					url: url
				}).then(function successCallback(response)
				{
					$scope.switchTurn();
					var lastMove = $scope.moves.pop();
					if(lastMove.wksc)
						$scope.undoWhiteKingsideCastle();
					else if(lastMove.wqsc)
						$scope.undoWhiteQueensideCastle();
					else if(lastMove.bksc)
						$scope.undoBlackKingsideCastle();
					else if(lastMove.bqsc)
						$scope.undoBlackQueensideCastle();
					else if(lastMove.ep)
					{
						lastMove.epCaptureSquare.appendChild(lastMove.captured);
						$scope.movePiece(lastMove.moved,document.getElementById(lastMove.from));
					}
					else if($scope.isPromotion(lastMove.moved,lastMove.from,lastMove.to))
					{
						$scope.movePiece(lastMove.moved,document.getElementById(lastMove.from));
						if(lastMove.captured != null)
							document.getElementById(lastMove.to).appendChild(lastMove.captured);
						if($scope.isWhiteTurn)
							$scope.changePiece(lastMove.moved,'P');
						else
							$scope.changePiece(lastMove.moved,'p');
					}
					else
					{
						document.getElementById(lastMove.from).appendChild(lastMove.moved);
						if(lastMove.captured != null)
							document.getElementById(lastMove.to).appendChild(lastMove.captured);
					}
					$scope.getLegalMoves();
				}, function errorCallback(response) 
				{
					console.log('ERROR - from $scope.undo()');
					console.log(response);
				});
			}
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
			return $scope.fileMap[n];
		};
		
		$scope.uciToNumber = function(uci)
		{
			var file = uci.charAt(0);
			var rank = uci.charAt(1);
			file = $scope.fileMap[file];
			rank = parseInt(rank);
			return ((8*(rank-1))+(file-1));
		};
		
		$scope.numberToUci = function(n)
		{
			var rank = Math.ceil((n+1) / 8);
			var file = (n % 8)+1;
			file = $scope.fileMap[file]
			return file.toString() + rank.toString();
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
		
		$scope.calculateMove = function()
		{
			$scope.calculatingMove = true;
			var url = $scope.rootURL + 'calculate_move/4';
			$http({
				method: 'GET',
				url: url
			}).then(function successCallback(response) 
			{
				$scope.calculatingMove = false;
				console.log(response.data);
				var from = response.data.substring(0,2);
				var to = response.data.substring(2,4);
				var piece = document.getElementById(from).children[0];
				$scope.movePiece(piece,document.getElementById(to));
				$scope.switchTurn();
				$scope.getLegalMoves();
				return response.data;
			}, function errorCallback(response)
			{
				console.log('ERROR - $scope.handleDrop()');
				console.log(response);
			});
		};

		$scope.handleDrop = function(ev,square)
		{
		    var piece = document.getElementById(ev.dataTransfer.getData("text"));
		    var captured = square.children[0];
		    var to = square.id;
		    var from = piece.parentElement.id;
			var uci = from + to;
			if($scope.isPromotion(piece,from,to))
			{
				var notation = $scope.toNotation(piece,to,from,captured);
				$scope.promotionMove = {
							notation:notation, 
							moved:piece, 
							captured:captured, 
							to:to, 
							from:from, 
						};
				$scope.showPromotionModal();
			}
		    if($scope.isLegalMove(uci))
		    {
				var url = $scope.rootURL + 'move/' + uci
				$http({
					method: 'GET',
					url: url
				}).then(function successCallback(response) 
				{
					if(response.data.kingside)
					{
						if($scope.isWhiteTurn)
							$scope.makeWhiteKingsideCastle();
						else
							$scope.makeBlackKingsideCastle();
					}
					else if(response.data.queenside)
					{
						if($scope.isWhiteTurn)
							$scope.makeWhiteQueensideCastle();
						else
							$scope.makeBlackQueensideCastle();
					}
					else if(response.data.ep)
					{
						$scope.makeEnPassant(square,piece,captured,from,to,response.data.epSquare);
					}
					else
					{
						$scope.makeStandardMove(square,piece,captured,from,to);
					}
					
					if(response.data.checkmate)
					{
						alert('checkmate');
					}
					else if(response.data.stalemate)
					{
						alert('stalemate');
					}
					else if(response.data.threefoldRepitition)
					{
						alert('draw threefold repitition');
					}
					else if(response.data.insufficientMaterial)
					{
						alert('insufficient material');
					}
				}, function errorCallback(response)
				{
					console.log('ERROR - $scope.handleDrop()');
					console.log(response);
				});
			}
		};
		
		$scope.makeEnPassant = function(square,moved,captured,from,to,epSquare)
		{
			//determine square of captured pawn
			var epCaptureSquare;
			if($scope.isWhiteTurn)
			{
				epCaptureSquare = document.getElementById($scope.numberToUci(epSquare-8));
			}
			else
			{
				epCaptureSquare = document.getElementById($scope.numberToUci(epSquare+8));
			}
			
			//make the piece moves
			$scope.movePiece(moved,document.getElementById(to));
			
			//set captured and remove piece from square
			captured = epCaptureSquare.children[0];
			epCaptureSquare.removeChild(captured);
			
			var notation = $scope.toNotation(moved,to,from,captured);
			notation = notation+'e.p.';
			//push move
			var move = {
							notation:notation, 
							moved:moved, 
							captured:captured, 
							to:to, 
							from:from,
							ep:true,
							epCaptureSquare:epCaptureSquare
						};
			$scope.moves.push(move);
			
			//switch turn
			$scope.switchTurn();
			
			//get new legal moves
			$scope.getLegalMoves();
		};
				
		$scope.isPromotion = function(piece,from,to)
		{
			var pieceType = $('#'+piece.id).attr('piece-type');
			if(pieceType=='pawn')
			{
				if(from.charAt(1) == '7')
				{
					if(to.charAt(1) == '8')
					{
						return true;
					}	
				}
				if(from.charAt(1) == '2')
				{
					if(to.charAt(1) == '1')
					{
						return true;
					}
				}	
			}
			return false;
		};
		
		$scope.makePromotion = function(promoteType)
		{
			var move = $scope.promotionMove;
			move.notation = move.notation + "=" + promoteType.toUpperCase();
			var uci = move.from + move.to + promoteType;
			var url = $scope.rootURL + 'move/' + uci;
			$http({
				method: 'GET',
				url: url
			}).then(function successCallback(response) 
			{	
				$scope.movePiece(move.moved,document.getElementById(move.to));
				$scope.moves.push(move);
				if($scope.isWhiteTurn)
					$scope.changePiece(move.moved,promoteType.toUpperCase());
				else
					$scope.changePiece(move.moved,promoteType);
				$scope.switchTurn();
				$scope.getLegalMoves();
				$scope.hidePromotionModal();
			}, function errorCallback(response)
			{
				console.log('ERROR - from $scope.makePromotion()');
				console.log(response);
			});
		};
		
		$scope.changePiece = function(piece,typeStr)
		{
			var path = piece.src;
			var rm = ''; 
			var add = '';
			if(typeStr=='P')
			{
				path = 'images/white_pawn.png';
				rm = 'piece';
				add = 'pawn';
			}
			if(typeStr=='N')
			{	
				path = 'images/white_knight.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='B')
			{
				path = 'images/white_bishop.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='R')
			{
				path = 'images/white_rook.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='Q')
			{
				path = 'images/white_queen.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='p')
			{
				path = 'images/black_pawn.png';
				rm = 'piece';
				add = 'pawn';
			}
			if(typeStr=='n')
			{
				path = 'images/black_knight.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='b')
			{
				path = 'images/black_bishop.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='r')
			{
				path = 'images/black_rook.png';
				rm = 'pawn';
				add = 'piece';
			}
			if(typeStr=='q')
			{
				path = 'images/black_queen.png';
				rm = 'pawn';
				add = 'piece';
			}
			piece.src = path;
			piece.classList.remove(rm);
			piece.classList.add(add);
		};
		
		//handles all functionality for making a standard move
		$scope.makeStandardMove = function(square,moved,captured,from,to,wksc,wqsc,bksc,bqsc)
		{
			//move the pieces
			$scope.movePiece(moved,square);
			
			//push move onto the stack
			var notation = $scope.toNotation(moved,to,from,captured);
			$scope.pushMove(notation,moved,captured,to,from);
			
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
		
		//TODO: refactor to only handle standard moves
		$scope.pushMove = function(notation,moved,captured,to,from)
		{
			var move = {
							notation:notation, 
							moved:moved, 
							captured:captured, 
							to:to, 
							from:from
						};
			$scope.moves.push(move);
		};
				
		$scope.makeWhiteKingsideCastle = function()
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
			$scope.pushWhiteKingsideCastle();
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
            
			$scope.pushWhiteKingsideCastle = function()
			{
				var moved = document.getElementById('king-e1');
				var move = {
								notation:'0-0', 
								moved:moved, 
								captured:undefined, 
								to:'g1', 
								from:'e1',
								wksc:true
							};
				$scope.moves.push(move);
			};
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
			$scope.pushWhiteQueensideCastle();
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
		};
			$scope.pushWhiteQueensideCastle = function()
			{
				var moved = document.getElementById('king-e1');
				var move = {
								notation:'0-0-0', 
								moved:moved, 
								captured:undefined, 
								to:'g1', 
								from:'c1',
								wqsc:true
							};
				$scope.moves.push(move);
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
		
		$scope.makeBlackKingsideCastle = function()
		{
			//move king
			var king = document.getElementById('king-e8');
			var kingTo = document.getElementById('g8');
			$scope.movePiece(king,kingTo);
			
			//move rook
			var rook = document.getElementById('rook-h8');
			var rookTo = document.getElementById('f8');
			$scope.movePiece(rook,rookTo);
			
			//pushing move to stack
			$scope.pushBlackKingsideCastle();
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
		};
			$scope.pushBlackKingsideCastle = function()
			{
				var moved = document.getElementById('king-e8');
				var move = {
								notation:'0-0', 
								moved:moved, 
								captured:undefined, 
								to:'g8', 
								from:'e8',
								bksc:true
							};
				$scope.moves.push(move);
			};
		
		$scope.undoBlackKingsideCastle = function()
		{
			//move king back
			var king = document.getElementById('king-e8');
			var kingTo = document.getElementById('e8');
			$scope.movePiece(king,kingTo);
			
			//move rook back
			var rook = document.getElementById('rook-h8');
			var rookTo = document.getElementById('h8');
			$scope.movePiece(rook,rookTo);
		};
		
		$scope.makeBlackQueensideCastle = function()
		{
			//move king
			var king = document.getElementById('king-e8');
			var kingTo = document.getElementById('c8');
			$scope.movePiece(king,kingTo);
			
			//move rook
			var rook = document.getElementById('rook-a8');
			var rookTo = document.getElementById('d8');
			$scope.movePiece(rook,rookTo);
			
			//pushing move to stack
			$scope.pushBlackQueensideCastle();
			
			//change the turn
			$scope.switchTurn();
			
			//update new set of legal moves
			$scope.getLegalMoves();
		};
			$scope.pushBlackQueensideCastle = function()
			{
				var moved = document.getElementById('king-e8');
				var move = {
								notation:'0-0-0', 
								moved:moved, 
								captured:undefined, 
								to:'g8', 
								from:'c8',
								bqsc:true
							};
				$scope.moves.push(move);
			};
		
		$scope.undoBlackQueensideCastle = function()
		{
			//move king back
			var king = document.getElementById('king-e8');
			var kingTo = document.getElementById('e8');
			$scope.movePiece(king,kingTo);
			
			//move rook back
			var rook = document.getElementById('rook-a8');
			var rookTo = document.getElementById('a8');
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
				console.log('ERROR - from $scope.getLegalMoves()');
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
				$scope.resetBoard();
				$scope.setTurn('white');
				$scope.getLegalMoves();
			}, function errorCallback(response) 
			{
				console.log('ERROR - from $scope.newGame()');
				console.log(response);
			});
		};
		
		$scope.init = function()
		{
			var url = $scope.rootURL + 'init'
			$http({
				method: 'POST',
				url: url
			}).then(function successCallback(response)
			{
				$scope.calculatingMove = false;
				$scope.getLegalMoves();
			}, function errorCallback(response) 
			{
				console.log('ERROR - from $scope.newGame()');
				console.log(response);
			});
		};
		
		$scope.showPromotionModal = function()
		{
			$('#promotionModal').modal('show');
		};
		
		$scope.hidePromotionModal = function()
		{
			$('#promotionModal').modal('hide');
		};
		
		$scope.resetBoard = function()
		{
			while($scope.moves.length > 0)
			{
				var lastMove = $scope.moves.pop();
				document.getElementById(lastMove.from).appendChild(lastMove.moved);
				if(lastMove.captured != null)
					document.getElementById(lastMove.to).appendChild(lastMove.captured);
			}
		};
		
		$scope.showTurn = function()
		{
			if($scope.isWhiteTurn)
				return "White's Turn";
			else
				return "Black's Turn";
		};
		
		/*Scope Functions*/
		
		/*Watch Functions*/
		$scope.$watch(function($scope) { return $scope.isWhiteTurn },
			function(newValue, oldValue)
			{
				console.log(newValue);
				if(!newValue)
					$scope.calculateMove();
			}
		);
		/*Watch Functions*/
		
		$scope.init()
	}
).directive('moveable', 
	function($document){
  		return function(scope, element, attr){
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