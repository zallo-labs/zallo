# select cfg::Config { ** };

# The number of concurrent disk I/O operations that can be executed simultaneously [1,1000]
# SSDs have queue depths >1000 & have greater throughput at greater queue depths
configure instance set effective_io_concurrency := 1000;

# The amount of memory used by internal query operations such as sorting.
# A single query may use multiple working memory buffers
configure instance set query_work_mem := <cfg::memory>"8MiB";

# Memory available to cache data - 50%
configure instance set shared_buffers := <cfg::memory>"4GiB";

# Total memory available to the database for caching - 75%
configure instance set effective_cache_size := <cfg::memory>"6GiB";