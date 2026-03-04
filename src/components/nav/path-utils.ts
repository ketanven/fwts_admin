const normalizePath = (path: string) => {
	const clean = path.split("?")[0]?.split("#")[0] || "/";
	if (clean !== "/" && clean.endsWith("/")) {
		return clean.slice(0, -1);
	}
	return clean || "/";
};

export const isPathActive = (pathname: string, itemPath: string) => {
	const current = normalizePath(pathname);
	const target = normalizePath(itemPath);

	if (target === "/") {
		return current === "/";
	}

	return current === target || current.startsWith(`${target}/`);
};
