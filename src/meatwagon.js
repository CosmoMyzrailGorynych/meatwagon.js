const tagPattern = /^(?<tagName>[\w-]+)?(?<ids>(?:[\.#][\w-]+)*)(?:\((?<attrs>[^\n]*)\))?$/;
const classesPattern = /(\.[\w-]+)/g;
const idsPattern = /(#[\w-]+)/g;
const indentation = /^\s*/;
const controlOpPattern = /^(if|while|for)\s*\([\s\S]+\)\{?$/;
const countIndentation = str => indentation.exec(str)[0].length;
const atomic = ['br', 'img', 'hr'];

const parse = input => {
    const lines = input.split('\n');
    const tree = [];
    const depthStack = [0];
    const tagStack = [];
    let currentNode = tree;
    let prevEntry;
    const goUp = () => {
        const parent = tagStack.pop();
        if (parent.type === 'tag') {
            currentNode.push({
                type: 'tagClose',
                tagName: parent.tagName
            });
        } else if (parent.type === 'code' && controlOpPattern.test(parent.value)) {
            currentNode.push({
                type: 'code',
                value: '}'
            });
        }
        depthStack.pop();
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed === '') {
            continue;
        }
        const lastDepth = depthStack[depthStack.length - 1];
        const newDepth = countIndentation(line);
        if (newDepth < lastDepth) {
            const depthInd = depthStack.indexOf(newDepth);
            if (depthInd === -1) {
                throw new Error(`Bad indentation at line ${i + 1}, expected depth: ${depthStack.join(', ')} spaces, got ${newDepth}.\n${line}`);
            }
            while (depthStack[depthStack.length - 1] !== newDepth) {
                goUp();
                currentNode = currentNode.parent;
            }
        } else if (newDepth > lastDepth) {
            if (['text', 'comment'].includes(prevEntry?.type)) {
                throw new Error(`Line ${i + 1}: entry of type ${prevEntry?.type} cannot have children.\n${line}`);
            }
            if (prevEntry?.type === 'tag' && atomic.includes(prevEntry.tagName)) {
                throw new Error(`Line ${i + 1}: tag ${prevEntry.tagName} cannot have children.\n${line}`);
            }
            const newNode = [];
            newNode.parent = currentNode;
            currentNode.push(newNode);
            depthStack.push(newDepth);
            tagStack.push(prevEntry);
            currentNode = newNode;
        } else {
            if (prevEntry?.type === 'tag') {
                currentNode.push({
                    type: 'tagClose',
                    tagName: prevEntry.tagName
                });
            }
        }
        if (trimmed[0] === '|') {
            prevEntry = {
                type: 'text',
                value: trimmed.slice(1).trimStart()
            };
            currentNode.push(prevEntry);
        } else if (trimmed.startsWith('//')) {
            if (trimmed[2] === '-') {
                prevEntry = {
                    type: 'comment',
                    value: trimmed.slice(3)
                };
                currentNode.push(prevEntry);
            }
        } else if (trimmed[0] === '-') {
            prevEntry = {
                type: 'code',
                value: trimmed.slice(1).trim()
            };
            if (controlOpPattern.test(prevEntry.value)) {
                prevEntry.value += '{';
            }
            currentNode.push(prevEntry);
        } else {
            const parsed = tagPattern.exec(trimmed);
            if (!parsed) {
                throw new Error(`Line ${i + 1}: malformed tag.\n${trimmed}`);
            }
            const {tagName, ids, attrs} = parsed.groups;
            prevEntry = {
                type: 'tag',
                tagName: tagName || 'div',
                ids,
                attrs,
            };
            currentNode.push(prevEntry);
        }
    }
    while (tagStack.length) {
        goUp();
    }
    return tree;
};

const escapist = /'/g;
const escapeQuotes = str => str.replace(escapist, '\\`');

let isPrevNodeHtml;
const walk = node => {
    if (node instanceof Array) {
        return node.map(walk).join('');
    }
    const prefix = isPrevNodeHtml ? '' : 'html += `';
    isPrevNodeHtml = node.type !== 'code';
    switch (node.type) {
        case 'comment':
            return `${prefix}<!--${escapeQuotes(node.value)}-->;`;
        case 'code':
            if (!prefix) {
                return `\`;${node.value}`;
            }
            return node.value;
        case 'text':
            return `${prefix}${escapeQuotes(node.value)}`;
        case 'tag':
            let attrsString = node.attrs? (' ' + node.attrs) : '';
            if (node.ids) {
                const id = idsPattern.exec(node.ids)?.[0],
                      classes = node.ids.match(classesPattern);
                if (id) {
                    attrsString += ` id="${id.slice(1)}" `;
                }
                if (classes?.length) {
                    attrsString += ' class="';
                    for (const c of classes) {
                        attrsString += c.slice(1) + ' ';
                    }
                    attrsString = attrsString.slice(0, -1) + '" ';
                }
                attrsString = attrsString.slice(0, -1);
            }
            return `${prefix}<${node.tagName}${escapeQuotes(attrsString)}>`;
        case 'tagClose':
            return `${prefix}</${node.tagName}>`;
    }
};
const makeRenderer = code => new Function('state', code);
const compile = tree => {
    let output = 'let html = \'\';';
    output += walk(tree);
    if (isPrevNodeHtml) {
        output += '`;';
    }
    output += 'return html;'
    return output;
};
export default {
    render(input, state) {
        return makeRenderer(compile(parse(input)))(state);
    },
    renderer(input) {
        return makeRenderer(compile(parse(input)));
    }
};