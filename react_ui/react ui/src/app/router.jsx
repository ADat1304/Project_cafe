import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext({ path: '/', navigate: () => {} });

const getHashPath = () => window.location.hash.replace(/^#/, '') || '/';

export function HashRouter({ children }) {
    const [path, setPath] = useState(getHashPath);

    useEffect(() => {
        const handleHashChange = () => setPath(getHashPath());
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (to, { replace } = {}) => {
        const newHash = `#${to}`;
        if (replace) {
            window.location.replace(newHash);
        } else {
            window.location.hash = newHash;
        }
        setPath(to || '/');
    };

    const value = useMemo(() => ({ path, navigate }), [path]);

    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
    return useContext(RouterContext);
}

export function Routes({ children }) {
    return <>{children}</>;
}

export function Route({ path, element }) {
    const { path: currentPath } = useRouter();
    if (path === currentPath) {
        return element;
    }
    return null;
}

export function Navigate({ to, replace = false }) {
    const { navigate } = useRouter();
    useEffect(() => {
        navigate(to, { replace });
    }, [navigate, replace, to]);
    return null;
}

export function Link({ to, children, className }) {
    const { navigate } = useRouter();

    const handleClick = (event) => {
        event.preventDefault();
        navigate(to);
    };

    return (
        <a className={className} href={`#${to}`} onClick={handleClick}>
            {children}
        </a>
    );
}
