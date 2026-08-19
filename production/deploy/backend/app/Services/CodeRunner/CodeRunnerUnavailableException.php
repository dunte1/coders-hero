<?php

namespace App\Services\CodeRunner;

use RuntimeException;

class CodeRunnerUnavailableException extends RuntimeException
{
    public function __construct(string $message = 'Code execution service is not available.')
    {
        parent::__construct($message);
    }
}
