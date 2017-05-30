import chess

def moves_to_board(moves):
    board = chess.Board()
    for move in moves:
        board.push(move)
    return board

def moves_to_legal_moves_list(moves):
    return list(moves_to_board(moves).legal_moves)
    
# def evaluate_sort(board,legal_moves,eval,rev=False):
    # temp = []
    # result = []
    # for move in legal_moves:
        # board.push(move)
        # temp.append((move,eval(board)))
        # board.pop()
    # temp.sort(key=lambda tup: tup[1],reverse=rev)
    # for tup in temp:
        # result.append(tup[0])
    # return result

def evaluate_sort(board,eval,rev=False):
    temp = []
    result = []
    for move in board.legal_moves:
        board.push(move)
        temp.append((move,eval(board)))
        board.pop()
    temp.sort(key=lambda tup: tup[1],reverse=rev)
    for tup in temp:
        result.append(tup[0])
    return result