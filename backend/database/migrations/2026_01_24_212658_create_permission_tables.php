<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $teams = config('permission.teams');
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');

        $pivotRole = $columnNames['role_pivot_key'] ?? 'role_id';
        $pivotPermission = $columnNames['permission_pivot_key'] ?? 'permission_id';

        Schema::create($tableNames['permissions'], function (Blueprint $table) {
            $table->engine = 'InnoDB ROW_FORMAT=DYNAMIC';

            $table->bigIncrements('id');
            $table->string('name', 191);
            $table->string('guard_name', 191);
            $table->timestamps();

            $table->unique(['name', 'guard_name'], 'permissions_name_guard_unique');
        });

        Schema::create($tableNames['roles'], function (Blueprint $table) use ($teams, $columnNames) {
            $table->engine = 'InnoDB ROW_FORMAT=DYNAMIC';

            $table->bigIncrements('id');

            if ($teams) {
                $table->unsignedBigInteger($columnNames['team_foreign_key'])->nullable();
                $table->index($columnNames['team_foreign_key']);
            }

            $table->string('name', 191);
            $table->string('guard_name', 191);
            $table->timestamps();

            if ($teams) {
                $table->unique(
                    [$columnNames['team_foreign_key'], 'name', 'guard_name'],
                    'roles_team_name_guard_unique'
                );
            } else {
                $table->unique(['name', 'guard_name'], 'roles_name_guard_unique');
            }
        });

        Schema::create($tableNames['model_has_permissions'], function (Blueprint $table) use (
            $tableNames,
            $columnNames,
            $pivotPermission,
            $teams
        ) {
            $table->engine = 'InnoDB ROW_FORMAT=DYNAMIC';

            $table->unsignedBigInteger($pivotPermission);
            $table->string('model_type', 191);
            $table->unsignedBigInteger($columnNames['model_morph_key']);

            $table->index(
                [$columnNames['model_morph_key'], 'model_type'],
                'model_has_permissions_model_index'
            );

            $table->foreign($pivotPermission)
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');

            if ($teams) {
                $table->unsignedBigInteger($columnNames['team_foreign_key']);

                $table->primary(
                    [$columnNames['team_foreign_key'], $pivotPermission, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_permissions_primary'
                );
            } else {
                $table->primary(
                    [$pivotPermission, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_permissions_primary'
                );
            }
        });

        Schema::create($tableNames['model_has_roles'], function (Blueprint $table) use (
            $tableNames,
            $columnNames,
            $pivotRole,
            $teams
        ) {
            $table->engine = 'InnoDB ROW_FORMAT=DYNAMIC';

            $table->unsignedBigInteger($pivotRole);
            $table->string('model_type', 191);
            $table->unsignedBigInteger($columnNames['model_morph_key']);

            $table->index(
                [$columnNames['model_morph_key'], 'model_type'],
                'model_has_roles_model_index'
            );

            $table->foreign($pivotRole)
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');

            if ($teams) {
                $table->unsignedBigInteger($columnNames['team_foreign_key']);

                $table->primary(
                    [$columnNames['team_foreign_key'], $pivotRole, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_roles_primary'
                );
            } else {
                $table->primary(
                    [$pivotRole, $columnNames['model_morph_key'], 'model_type'],
                    'model_has_roles_primary'
                );
            }
        });

        Schema::create($tableNames['role_has_permissions'], function (Blueprint $table) use (
            $tableNames,
            $pivotRole,
            $pivotPermission
        ) {
            $table->engine = 'InnoDB ROW_FORMAT=DYNAMIC';

            $table->unsignedBigInteger($pivotPermission);
            $table->unsignedBigInteger($pivotRole);

            $table->foreign($pivotPermission)
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');

            $table->foreign($pivotRole)
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');

            $table->primary(
                [$pivotPermission, $pivotRole],
                'role_has_permissions_primary'
            );
        });

        app('cache')
            ->store(config('permission.cache.store') !== 'default' ? config('permission.cache.store') : null)
            ->forget(config('permission.cache.key'));
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');

        Schema::dropIfExists($tableNames['role_has_permissions']);
        Schema::dropIfExists($tableNames['model_has_roles']);
        Schema::dropIfExists($tableNames['model_has_permissions']);
        Schema::dropIfExists($tableNames['roles']);
        Schema::dropIfExists($tableNames['permissions']);
    }
};
