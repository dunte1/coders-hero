<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    public function all(array $columns = ['*']): \Illuminate\Database\Eloquent\Collection;

    public function findById(int|string $id, array $columns = ['*'], array $relations = []): ?Model;

    public function create(array $data): Model;

    public function update(int|string $id, array $data): Model;

    public function delete(int|string $id): bool;

    public function paginate(int $perPage = 15, array $columns = ['*'], array $relations = []): LengthAwarePaginator;

    public function search(string $term, array $columns = [], int $perPage = 15): LengthAwarePaginator;

    public function withTrashed(): \Illuminate\Database\Eloquent\Builder;

    public function restore(int|string $id): bool;

    public function forceDelete(int|string $id): bool;

    public function count(): int;

    public function exists(array $conditions): bool;
}
