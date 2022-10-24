type Vector2 = { x: number; y: number };

enum WindingOrder {
    Invalid,
    Clockwise,
    CounterClockwise,
}

function sub(a: Vector2, b: Vector2) {
    return { x: a.x - b.x, y: a.y - b.y } as Vector2;
}

function cross(a: Vector2, b: Vector2) {
    return a.x * b.y - a.y * b.x;
}

function get_item<T>(array: T[], index: number) {
    if (index >= array.length) return array[index % array.length];

    if (index < 0) return array[(index % array.length) + array.length];

    return array[index];
}

function triangulate(vertices: Vector2[]) {
    vertices = [...vertices].map(({ x, y }) => ({ x, y }));

    if (vertices.length < 3) throw new Error(`there must be at least three vertices`);

    if (!is_simple_polygon(vertices)) throw new Error(`vertices do not form a simple polygon`);

    if (contains_colinear_edges(vertices)) throw new Error(`vertices contains colinear edges`);

    const [, order] = compute_polygon_area(vertices);

    if (order === WindingOrder.Invalid) throw new Error(`vertices do not form a valid polygon`);

    if (order === WindingOrder.CounterClockwise) vertices.reverse();

    const index_list = vertices.map((_, i) => i);

    const triangles = [] as Vector2[][];

    while (index_list.length > 3) {
        main: for (let i = 0; i < index_list.length; i++) {
            const a = index_list[i];
            const b = get_item(index_list, i - 1);
            const c = get_item(index_list, i + 1);

            const va = vertices[a];
            const vb = vertices[b];
            const vc = vertices[c];

            const va_to_vb = sub(vb, va);
            const va_to_vc = sub(vc, va);

            if (cross(va_to_vb, va_to_vc) < 0) continue;

            for (let j = 0; j < vertices.length; j++) {
                if ([a, b, c].includes(j)) continue;

                const p = vertices[j];

                if (is_point_in_triangle(p, vb, va, vc)) continue main;
            }

            triangles.push([vb, va, vc]);

            index_list.splice(i, 1);

            break;
        }
    }

    triangles.push(index_list.map((i) => vertices[i]));

    return triangles;
}

function is_point_in_triangle(p: Vector2, a: Vector2, b: Vector2, c: Vector2) {
    const ab = sub(b, a);
    const bc = sub(c, b);
    const ca = sub(a, c);

    const ap = sub(p, a);
    const bp = sub(p, b);
    const cp = sub(p, c);

    const cross1 = cross(ab, ap);
    const cross2 = cross(bc, bp);
    const cross3 = cross(ca, cp);

    return ![cross1, cross2, cross3].some((x) => x > 0);
}

function is_simple_polygon(vertices: Vector2[]) {
    const ccw = (a: Vector2, b: Vector2, c: Vector2) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);

    const edges = vertices.map((p, i, a) => [get_item(a, i - 1), p]);

    console.log(edges);

    for (const i of edges) {
        for (const j of edges) {
            const [a, b, c, d] = [...i, ...j];

            if ([...new Set([a, b, c, d])].length !== 4) continue;

            if (ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)) return false;
        }
    }

    return true;
}

function contains_colinear_edges(vertices: Vector2[]) {
    for (let i = 0; i < vertices.length; i++) {
        const va = vertices[i];
        const vb = get_item(vertices, i - 1);
        const vc = get_item(vertices, i + 1);

        const va_to_vb = sub(vb, va);
        const va_to_vc = sub(vc, va);

        if (cross(va_to_vb, va_to_vc) === 0) return true;
    }

    return false;
}

function compute_polygon_area(vertices: Vector2[]) {
    const area = vertices.reduce(
        (area, p, i, a) => area + (get_item(a, i - 1).x + p.x) * (get_item(a, i - 1).y - p.y),
        0
    );

    return [
        Math.abs(area / 2),
        area === 0 ? WindingOrder.Invalid : area > 0 ? WindingOrder.Clockwise : WindingOrder.CounterClockwise,
    ];
}

export {
    compute_polygon_area,
    contains_colinear_edges,
    is_point_in_triangle,
    is_simple_polygon,
    Vector2,
    WindingOrder,
};
export default triangulate;
