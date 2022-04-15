//TODO: https://llimllib.github.io/pymag-trees/

function setGraphTreeLayout(nodes, links) {
    let currentXLength = 200;
    let currentX = -(currentXLength / 2.0);
    let currentY = 250.0;
    let levelHeight = 50;
    let root = findRoot(nodes, links);
    let lengthMultiplier = 2.5;
    root.x = 0.0;
    root.y = currentY;
    root.z = 0.0;

    let nextLevelNodes = findNextLevelNodes([root], nodes, links);
    let i = 0;
    while (nextLevelNodes.length > 0) {
        currentY -= levelHeight;
        let groupedByParents = groupNodesByParents(nextLevelNodes, links);
        let groupLength = currentXLength / groupedByParents.size;
        console.log(groupedByParents)
        groupedByParents.forEach((childNodes, parentNode) => {
            console.log(childNodes)
            let distance = groupLength / (childNodes.length);
            let groupCurrentX = currentX + distance / 2.0;
            childNodes.forEach(node => {
                node.x = groupCurrentX;
                node.y = currentY;
                node.z = 0.0;
                groupCurrentX += distance;
            })
            currentX += groupLength;
        })
        currentXLength *= lengthMultiplier;
        lengthMultiplier = Math.max(Math.sqrt(lengthMultiplier), 1.0);
        currentX = -(currentXLength / 2);
        nextLevelNodes = findNextLevelNodes(nextLevelNodes, nodes, links);
    }
}

function findRoot(nodes, links) {
    let node = nodes[0];
    while (findParent(node, links) != null) {
        node = findParent(node, links);
    }
    return node;
}

function findNextLevelNodes(parentNodes, nodes, links) {
    let parentIds = parentNodes.map(node => node.id);
    let childIds = links
        .filter(link => containsObject(link.source.id, parentIds))
        .map(link => link.target.id);
    return nodes.filter(node => childIds.includes(node.id));
}

function containsObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

function groupNodesByParents(nodes, links) {
    let result = new Map();
    nodes.forEach(node => {
        let parent = findParent(node, links);
        if (!result.has(parent)) {
            result.set(parent, []);
        }
        result.get(parent).push(node);
    });
    return result;
}

function findParent(node, links) {
    let link = links.find(link => link.target.id === node.id);
    if (link !== undefined) {
        return link.source;
    }
    return null;
}

export {setGraphTreeLayout};