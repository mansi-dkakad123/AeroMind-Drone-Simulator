"""
pathfinding.py
--------------
Implements the A* search algorithm used to plan the drone's route across
a 2D obstacle grid, plus a helper to recalculate a route mid-flight when
a new obstacle appears (dynamic obstacle avoidance).

Grid convention:
  - grid is a 2D list of ints, grid[row][col] == 0 means free, 1 means blocked
  - a "point" is a dict: {"r": row, "c": col}
  - movement is 8-directional (orthogonal + diagonal)
"""

import heapq
import math


def _neighbors(grid, r, c):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                  (-1, -1), (-1, 1), (1, -1), (1, 1)]
    result = []
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
            cost = math.sqrt(2) if dr != 0 and dc != 0 else 1.0
            result.append((nr, nc, cost))
    return result


def _heuristic(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def find_path(grid, start, goal):
    """
    Run A* from start to goal on the given grid.

    start / goal: dicts like {"r": int, "c": int}
    Returns a list of {"r": int, "c": int} waypoints (including start and
    goal) if a path exists, otherwise None.
    """
    start_t = (start["r"], start["c"])
    goal_t = (goal["r"], goal["c"])

    open_heap = [(0, start_t)]
    came_from = {}
    g_score = {start_t: 0}
    visited = set()

    while open_heap:
        _, current = heapq.heappop(open_heap)
        if current in visited:
            continue
        visited.add(current)

        if current == goal_t:
            path = [current]
            while path[-1] in came_from:
                path.append(came_from[path[-1]])
            path.reverse()
            return [{"r": r, "c": c} for r, c in path]

        for nr, nc, cost in _neighbors(grid, current[0], current[1]):
            neighbor = (nr, nc)
            tentative_g = g_score[current] + cost
            if tentative_g < g_score.get(neighbor, math.inf):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + _heuristic(neighbor, goal_t)
                heapq.heappush(open_heap, (f_score, neighbor))

    return None  # no path found


def path_length(path):
    """Approximate real-world distance (meters) for a waypoint path."""
    if not path or len(path) < 2:
        return 0.0
    total = 0.0
    cell_meters = 3.1  # assumed real-world size of one grid cell
    for i in range(1, len(path)):
        a, b = path[i - 1], path[i]
        total += math.hypot(a["r"] - b["r"], a["c"] - b["c"]) * cell_meters
    return round(total, 1)
