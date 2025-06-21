import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Conversations = () => {
    const messages = [
        { name: "Fedi M.", text: "Salut ! Tu es dispo ?" },
        { name: "Nour B.", text: "Très bon échange, merci !" },
        { name: "Wassim K.", text: "On peut s'appeler ?" },
    ];
    return (_jsxs("section", { className: "conversations", children: [_jsx("h4", { children: "Conversations" }), _jsx("ul", { children: messages.map((msg, index) => (_jsxs("li", { children: [_jsxs("div", { children: [_jsx("strong", { children: msg.name }), _jsx("p", { children: msg.text })] }), _jsx("button", { children: "R\u00E9pondre" })] }, index))) })] }));
};
export default Conversations;
