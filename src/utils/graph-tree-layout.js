//TODO: https://llimllib.github.io/pymag-trees/

function setGraphTreeLayout(nodes, links) {
    let root = findRoot(nodes, links);
    try {
        let tree = createTreeLayoutStructure(root, null, 0, 1, nodes, links);
        console.log(tree);
        tree = buchheim(tree);
        let shift = tree.x;
        setPositions(tree, shift);
    } catch (e) {
        console.error(e)
    }
}

function setPositions(tree, shift) {
    tree.tree.x = (tree.x - shift) * 20;
    tree.tree.y = -tree.y * 50;
    tree.tree.z = 0.0;
    for (let i = 0; i < tree.additionalSiblings.length; i += 2) {
        tree.additionalSiblings[i].x = tree.tree.x;
        tree.additionalSiblings[i].y = tree.tree.y;
        tree.additionalSiblings[i].z = tree.tree.z + ((i / 2 + 1) * 10);
        tree.additionalSiblings[i + 1].x = tree.tree.x;
        tree.additionalSiblings[i + 1].y = tree.tree.y;
        tree.additionalSiblings[i + 1].z = tree.tree.z - ((i / 2 + 1) * 10);
    }
    if (tree.children.length > 0) {
        tree.children.forEach(node => setPositions(node, shift));
    }
}

function findRoot(nodes, links) {
    let node = nodes[0];
    while (findParent(node, links) != null) {
        node = findParent(node, links);
    }
    return node;
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

function findParent(node, links) {
    let link = links.find(link => link.target.id === node.id);
    if (link !== undefined) {
        return link.source;
    }
    return null;
}

function createTreeLayoutStructure(tree, parent, depth, number, nodes, links, additionalSiblings = []) {
    let self = {};
    self.x = -1;
    self.y = depth;
    self.tree = tree;
    self.additionalSiblings = additionalSiblings;
    let currentChildren = findChildren(tree, links);
    let mainChildren = findMainChildrenNodes(currentChildren, links);
    self.children = [];
    let additionalChildren = findAdditionalChildren(currentChildren, mainChildren);
    for (let i = 0; i < mainChildren.length; i++) {
        let filteredAdditionalChildren = additionalChildren.filter(n => n.label === mainChildren[i].label)
        self.children.push(createTreeLayoutStructure(mainChildren[i], self, depth + 1, i + 1, nodes, links, filteredAdditionalChildren))
    }
    self.parent = parent;
    self.thread = null;
    self.mod = 0;
    self.ancestor = self;
    self.change = 0;
    self.shift = 0;
    self.lmost_sibling = null;
    self.number = number;
    return self;
}

function left(tree) {
    if (tree.thread != null) {
        return tree.thread;
    }
    if (tree.children.length > 0) {
        return tree.children[0];
    }
    return null;
}

function right(tree) {
    if (tree.thread != null) {
        return tree.thread;
    }
    if (tree.children.length > 0) {
        return tree.children[tree.children.length - 1];
    }
    return null;
}

function lbrother(tree) {
    let n = null;
    if (tree.parent != null) {
        for (let i = 0; i < tree.parent.children.length; i++) {
            if (tree.parent.children[i] === tree) {
                return n;
            }
            n = tree.parent.children[i];
        }
    }
    return n
}

function get_lmost_sibling(tree) {
    if (tree.lmost_sibling == null && tree.parent != null && tree !== tree.parent.children[0]) {
        tree.lmost_sibling = tree.parent.children[0];
    }
    return tree.lmost_sibling;
}

function buchheim(tree) {
    let dt = firstwalk(tree);
    let min = second_walk(dt);
    if (min < 0) {
        third_walk(dt, -min);
    }
    return dt;
}

function third_walk(tree, n) {
    tree.x += n;
    tree.children.forEach(c => {
        third_walk(c, n);
    })
}

function firstwalk(v, distance = 1.0) {
    if (v.children.length === 0) {
        if (get_lmost_sibling(v) != null) {
            v.x = lbrother(v).x + distance;
        } else {
            v.x = 0.0;
        }
    } else {
        let default_ancestor = v.children[0];
        v.children.forEach(w => {
            firstwalk(w);
            default_ancestor = apportion(w, default_ancestor, distance);
        })
        execute_shifts(v);
        let midpoint = (v.children[0].x + v.children[v.children.length - 1].x) / 2.0;
        let w = lbrother(v);
        if (w != null) {
            v.x = w.x + distance;
            v.mod = v.x - midpoint;
        } else {
            v.x = midpoint;
        }
        return v;
    }
}

function apportion(v, default_ancestor, distance) {
    let w = lbrother(v);
    if (w != null) {
        let vir = v;
        let vor = v;
        let vil = w;
        let vol = get_lmost_sibling(v);
        let sir = v.mod;
        let sor = v.mod;
        let sil = vil.mod;
        let sol = vol.mod;
        console.log(vir, vor, vil, vol, sir, sor, sil, sol)
        // if (right(vil) != null && right(vor) == null) {
        //     vor.thread = right(vil);
        // } else {
        //     if (left(vir) != null && left(vol) == null) {
        //         vol.thread = left(vir);
        //     }
        //     default_ancestor = v;
        // }
        while (right(vil) != null && left(vir) != null) {
            vil = right(vil);
            vir = left(vir);
            vol = left(vol);
            vor = right(vor);
            vor.ancestor = v;
            let shift = (vil.x + sil) - (vir.x + sir) + distance;
            if (shift > 0) {
                let a = ancestor(vil, v, default_ancestor);
                move_subtree(a, v, shift);
                sir = sir + shift;
                sor = sor + shift;
            }
            sil += vil.mod;
            sir += vir.mod;
            sol += vol.mod;
            sor += vor.mod;
        }
        if (right(vil) != null && right(vor) == null) {
            vor.thread = right(vil);
            vor.mod += sil - sor;
        } else {
            if (left(vir) != null && left(vol) == null) {
                vol.thread = left(vir);
                vol.mod += sir - sol;
            }
            default_ancestor = v;
        }
    }
    return default_ancestor;
}

function move_subtree(wl, wr, shift) {
    let subtrees = wr.number - wl.number;
    wr.change -= shift / subtrees;
    wr.shift += shift;
    wl.change += shift / subtrees;
    wr.x += shift;
    wr.mod += shift;
}

function execute_shifts(v) {
    let shift = 0.0;
    let change = 0.0;
    for (let i = v.children.length - 1; i >= 0; i--) {
        let w = v.children[i];
        w.x += shift;
        w.mod += shift;
        change += w.change;
        shift += w.shift + change;
    }
}

function ancestor(vil, v, default_ancestor) {
    if (containsObject(vil.ancestor, v.parent.children)) {
        console.log("VIL ANCESTOR: ", vil.ancestor);
        return vil.ancestor;
    } else {
        console.log("DEFAULT ANCESTOR: ", default_ancestor);
        return default_ancestor;
    }
}

function second_walk(v, m = 0.0, depth = 0.0, min = null) {
    v.x += m;
    v.y = depth;

    if (min == null || v.x < min) {
        min = v.x;
    }

    v.children.forEach(w => {
        min = second_walk(w, m + v.mod, depth + 1)
    })
    return min;
}

function findChildren(node, links) {
    let result = []
    links.forEach(link => {
        if (link.source.id === node.id) {
            result.push(link.target);
        }
    })
    return result;
}

function findMainChildrenNodes(nodes, links) {
    let result = [];
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].main) {
            result.push(nodes[i]);
        }
    }
    return result;
}

function numberOfSameLabelNodes(nodes, label) {
    let counter = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (label === nodes[i].label) {
            counter++;
        }
    }
    return counter;
}

function findAdditionalChildren(nodes, mainNodes) {
    return nodes.filter(n => !containsObject(n, mainNodes));
}


export {setGraphTreeLayout};