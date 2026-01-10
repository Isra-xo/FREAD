namespace GeneradorDeModelos.Helpers;

/// <summary>
/// Clase genérica para resultados paginados
/// </summary>
/// <typeparam name="T">Tipo de elementos en la lista</typeparam>
public class PagedResult<T>
{
    /// <summary>
    /// Lista de elementos de la página actual
    /// </summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();

    /// <summary>
    /// Número de página actual (basado en 1)
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Tamaño de página (número de elementos por página)
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total de elementos en todas las páginas
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Total de páginas disponibles
    /// </summary>
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    /// <summary>
    /// Indica si hay una página anterior
    /// </summary>
    public bool HasPrevious => PageNumber > 1;

    /// <summary>
    /// Indica si hay una página siguiente
    /// </summary>
    public bool HasNext => PageNumber < TotalPages;

    public PagedResult()
    {
    }

    public PagedResult(IEnumerable<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}
