//TODO: https://llimllib.github.io/pymag-trees/

function setGraphTreeLayout(nodes, links) {
    let root = findRoot(nodes, links);
    try {
        let tree = createTreeLayoutStructure(root, null, 0, 1, nodes, links);
        console.log(tree);
        tree = buchheim(tree);
        setPositions(tree);
    } catch (e) {
        console.error(e)
    }
}

function setPositions(tree) {
    tree.tree.x = tree.x * 150;
    tree.tree.y = -tree.y * 50;
    tree.tree.z = 0.0;
    if (tree.children.length > 0) {
        tree.children.forEach(node => setPositions(node));
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

function createTreeLayoutStructure(tree, parent, depth, number, nodes, links) {
    let self = {};
    self.x = -1;
    self.y = depth;
    self.tree = tree;
    let currentChildren = findChildren(tree, links);
    self.children = [];
    for (let i = 0; i < currentChildren.length; i++) {
        self.children.push(createTreeLayoutStructure(currentChildren[i], self, depth + 1, i + 1, nodes, links))
    }
    self.parent = parent;
    self.thread = null;
    self.offset = 0;
    self.ancestor = self;
    self.change = 0;
    self.shift = 0;
    self.lmost_sibling = null;
    self.number = number;
    return self;
}

function left_brother(tree) {
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

function right(tree) {
    if (tree.thread != null) {
        return tree.thread;
    }
    if (tree.children.length > 0) {
        return tree.children[tree.children.length - 1];
    }
    return null;
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

function buchheim(tree) {
    let dt = firstwalk(tree);
    second_walk(dt);
    return dt;
}

function firstwalk(v, distance = 1.0) {
    if (v.children.length === 0) {
        if (get_lmost_sibling(v) != null) {
            v.x = left_brother(v).x + distance;
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
        let w = left_brother(v);
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
    let w = left_brother(v);
    if (w != null) {
        let vir = v;
        let vor = v;
        let vil = w;
        let vol = get_lmost_sibling(v);
        let sir = v.mod;
        let sor = v.mod;
        let sil = vil.mod;
        let sol = vol.mod;
        if (right(vil) != null && right(vor) == null) {
            vor.thread = right(vil);
        } else {
            if (left(vir) != null && left(vol) == null) {
                vol.thread = left(vir);
            }
            default_ancestor = v;
        }
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
        return vil.ancestor;
    } else {
        return default_ancestor;
    }
}

function second_walk(v, m = 0.0, depth = 0.0) {
    v.x += m;
    v.y = depth;

    v.children.forEach(w => {
        if (v.mod == null || isNaN(v.mod)) {
            v.mod = 0.0;
        }
        second_walk(w, m + v.mod, depth + 1)
    })
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




export {setGraphTreeLayout};