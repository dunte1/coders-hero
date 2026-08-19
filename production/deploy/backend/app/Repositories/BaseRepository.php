<?php

namespace App\Repositories;

use App\Repositories\Interfaces\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all(array $columns = ['*']): Collection
    {
        return $this->model->query()->get($columns);
    }

    public function findById(int|string $id, array $columns = ['*'], array $relations = []): ?Model
    {
        return $this->model->query()
            ->with($relations)
            ->find($id, $columns);
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        $model = $this->model->findOrFail($id);
        $model->update($data);
        return $model->fresh();
    }

    public function delete(int|string $id): bool
    {
        $model = $this->model->findOrFail($id);
        return $model->delete();
    }

    public function paginate(int $perPage = 15, array $columns = ['*'], array $relations = []): LengthAwarePaginator
    {
        return $this->model->query()
            ->with($relations)
            ->paginate($perPage, $columns);
    }

    public function search(string $term, array $columns = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (empty($columns)) {
            $columns = array_filter($this->model->getFillable(), function ($col) {
                return !in_array($col, ['password', 'remember_token', 'meta', 'old_values', 'new_values', 'properties']);
            });
        }

        $query->where(function ($q) use ($term, $columns) {
            foreach ($columns as $index => $column) {
                $method = $index === 0 ? 'where' : 'orWhere';
                $q->$method($column, 'LIKE', "%{$term}%");
            }
        });

        return $query->paginate($perPage);
    }

    public function withTrashed(): Builder
    {
        return $this->model->withTrashed();
    }

    public function restore(int|string $id): bool
    {
        $model = $this->model->withTrashed()->findOrFail($id);
        return $model->restore();
    }

    public function forceDelete(int|string $id): bool
    {
        $model = $this->model->withTrashed()->findOrFail($id);
        return $model->forceDelete();
    }

    public function count(): int
    {
        return $this->model->query()->count();
    }

    public function exists(array $conditions): bool
    {
        return $this->model->query()->where($conditions)->exists();
    }
}
