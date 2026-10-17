export function puedeValorar(status: string, esCliente: boolean, yaValorado: boolean) {
  return status === "completed" && esCliente && !yaValorado;
}
export function promedioEstrellas(values: number[]) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10 : null;
}