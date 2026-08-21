<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        foreach ($filters as $field => $value) {
            if (is_null($value) || $value === '') {
                continue;
            }

            $method = 'filter' . str_replace('_', '', ucwords($field, '_'));

            if (method_exists($this, $method)) {
                $this->$method($query, $value);
            } elseif ($this->isFillable($field)) {
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                } else {
                    $query->where($field, $value);
                }
            }
        }

        return $query;
    }

    public function scopeSearch(Builder $query, ?string $search, array $columns = []): Builder
    {
        if (!$search) {
            return $query;
        }

        $table = $this->getTable();

        if (empty($columns)) {
            $columns = array_filter($this->getFillable(), function ($column) {
                return !in_array($column, ['password', 'remember_token']);
            });
        }

        $query->where(function ($q) use ($search, $columns, $table) {
            foreach ($columns as $index => $column) {
                $method = $index === 0 ? 'where' : 'orWhere';
                $q->$method("{$table}.{$column}", 'LIKE', "%{$search}%");
            }
        });

        return $query;
    }
}
