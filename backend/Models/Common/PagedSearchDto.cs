using CodeGenerator.Models.Dto;

namespace CodeGenerator.Models.Common
{
    public class PagedSearchDto
    {
        private int _pageIndex = 1;
        private int _pageSize = 10;

        public int PageIndex
        {
            get => _pageIndex;
            set => _pageIndex = value < 1 ? 1 : value;
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : value;
        }

        public List<SortingDto> Sorts { get; set; } = new();
    }
} 