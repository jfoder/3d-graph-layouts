function setGraphTreeLayout(nodes, links) {
    nodes.forEach(node => {
        console.log(node);
        console.log("NODE PRINTED");
        node.x += Math.random() * 500.0;
    });
    let root = findRoot(nodes, links);
    root.y += 500;
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
                if (node.id === link.source) {
                    return node;
                }
            })
            return null;
        }
    })
    return null;
}

export { setGraphTreeLayout };