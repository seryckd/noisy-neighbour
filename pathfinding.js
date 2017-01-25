/* exported PATHFINDING */

// Implementation of A* using distance between cells as heuristic
// Every cell has same G value
// http://www.policyalmanac.org/games/aStarTutorial.htm
// TODO add movement cost to hexgrid.Cell.
//
// Should also look here
// http://theory.stanford.edu/~amitp/GameProgramming/

function PATHFINDING(hexgridf) {
  "use strict";

   var hexgrid = hexgridf,
      openMap = new Map(),
      closeMap = new Map(),
      mapCellToNodes = {};

//   function outputCells(cells) {
//      var o = '';
//
//      cells.forEach(function (c) {
//         o += c.getHash();
//         o += ',';
//      });
//
//      return o;
//   }

//   function outputNodes(nodes) {
//      var o = '';
//
//      for (var value of nodes.values()) {
//         o += value.getHash();
//         o += ',';
//      }
//
//      return o;
//   }

   function Node(cell) {
      this.cell = cell;
      this.parent = null;

      this.F = 0;    // estimate code from start to target (G + H)
      this.G = 0;    // movement cost from start node to this node
      this.H = 0;    // estimated movement cost from this node to target node

      this.calulateF = function () {
         this.F = this.G + this.H;
      };

      this.isWalkable = function () {
         return !this.cell.isWall();
      };

      this.getHash = function () {
         return this.cell.getHash();
      };
   }

   // Node source
   // Node target
   function calculateH(source, target) {
      return hexgrid.distance(source.cell, target.cell);
   }

   function removeLowestF() {

      var lowF = -1,
         node = null;

      for (var value of openMap.values()) {
         if (lowF === -1 || value.F < lowF) {
            lowF = value.F;
            node = value;
         }
      }

      if (node !== null) {
         openMap.delete(node.getHash());
      }

      return node;
   }

   function to_node(cell) {

      var node = mapCellToNodes[cell.getHash()];

      if (node !== undefined) {
         return node;
      }

      node = new Node(cell);
      mapCellToNodes[cell.getHash()] = node;
      return node;
   }

   // Params
   // Node currentNode
   // Cells neighbours
   // Return nothing
   function processNeighbours(currentNode, neighbours, targetNode) {

      var node,
         G;

      neighbours.forEach(function (neighbour) {

         node = to_node(neighbour);

         if (!node.isWalkable() || closeMap.has(node.getHash())) {
            // Node that should not be considered
            return;
         }

         if (!openMap.has(node.getHash())) {

            // found new node
            openMap.set(node.getHash(), node);
            node.parent = currentNode;

            node.G = node.parent.G + 1;
            node.H = calculateH(node, targetNode);
            node.calulateF();

         } else {

            // Reached a node via a different path
            G = node.parent.G + 1;

            if (G < node.G) {
               // this is a better path
               node.parent = currentNode;
               node.G = G;
               // H remains the same
               node.calulateF();
            }
         }

      });

   }

   // Params
   // Node node
   function calculatePath(node) {

      var path = [];

      while (node !== null) {
         path.unshift(node.cell);
         node = node.parent;
      }

      return path;
   }

   //
   // hexgrid:
   // Cell start: starting cell
   // Cell end: ending cell
   // return: array of cells or null for not possible
   function findPath(startCell, endCell) {
      var currentNode,
         endNode = to_node(endCell),
         path = [];

      openMap.set(startCell.getHash(), to_node(startCell));

      while (openMap.size > 0) {

         currentNode = removeLowestF();

         if (currentNode.cell === endCell) {
            // found path, need to calculate it

            path = calculatePath(currentNode);

            break;
         }

         closeMap.set(currentNode.getHash(), currentNode);

         processNeighbours(currentNode, hexgrid.adjacent(currentNode.cell), endNode);
      }

      //console.log('path: ' + outputCells(path));

      return path;
   }

   // Breadth First Search
   // Params
   // Cell startCell
   // int movePoints
   // Return Map<Cell> cells that can be reached
   function findReachable(startCell, movePoints) {

      var frontier = [],
          reachable = new Map(),
          node = to_node(startCell),
          next,
          neighbours;

      frontier.push(node);
      reachable.set(node.getHash(), node.cell);

      while (frontier.length !== 0) {
         node = frontier.shift();

         neighbours = hexgrid.adjacent(node.cell);
         for (let index=0; index<neighbours.length; ++index) {
            next = to_node(neighbours[index]);

            if (reachable.has(next.getHash()) || !next.isWalkable()) {
               continue;
            }

            next.parent = node;

            // TODO needs to be actual movement cost of cell
            next.G = node.G + 1;

            if (next.G <= movePoints) {
               frontier.push(next);
               reachable.set(next.getHash(), next.cell);
            }
         }
      }

      return reachable;
   }

   return {
      findPath: findPath,
      findReachable: findReachable
   };

}
