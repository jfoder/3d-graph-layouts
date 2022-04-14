function setGraphTreeLayout(nodes, links) {
    console.log(links)
    let currentX = 0.0;
    let currentY = 250.0;
    let currentZ = 0.0;
    let levelHeight = 50;
    let root = findRoot(nodes, links);
    console.log('Root: ', root);
    root.x = 0.0;
    root.y = currentY;
    root.z = 0.0;

    let nextLevelNodes = findNextLevelNodes([root], nodes, links);
    let i = 0;
    while (nextLevelNodes.length > 0) {
        console.log(nextLevelNodes)
        currentY -= levelHeight;
        let groupedByParents = groupNodesByParents(nextLevelNodes, links)
        nextLevelNodes.forEach(node => {
            node.y = currentY;
            // node.z = currentZ;
        })
        nextLevelNodes = findNextLevelNodes(nextLevelNodes, nodes, links);
    }
}

function findRoot(nodes, links) {
    let node = nodes[0];
    while (findParent(node, nodes, links) != null) {
        node = findParent(node, nodes, links);
    }
    return node;
}

function findParent(node, nodes, links) {
    links.forEach(link => {
        if (link.target === node.id) {
            nodes.forEach(node => {
                if (node.id === link.source.id) {
                    return node;
                }
            })
            return null;
        }
    })
    return null;
}

function findNextLevelNodes(parentNodes, nodes, links) {
    let parentIds = parentNodes.map(node => node.id);
    let childIds = links
        .filter(link => containsObject(link.source.id, parentIds))
        .map(link => link.target.id);
    return nodes.filter(node => childIds.includes(node.id));
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

export { setGraphTreeLayout };