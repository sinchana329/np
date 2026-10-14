# ==============================================================================
# CMakeLists.txt - TCP Congestion Control & Network Routing Simulator
# CSE Network Programming AAT Final-Year Project Expansion
# ==============================================================================

cmake_minimum_required(VERSION 3.16)
project(TCP_and_Routing_Simulator VERSION 2.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(MSVC)
    add_compile_options(/W4 /O2)
else()
    add_compile_options(-Wall -Wextra -Wpedantic -O3)
endif()

# ------------------------------------------------------------------------------
# 1. Core TCP Simulation Target
# ------------------------------------------------------------------------------
add_library(tcp_sim_core STATIC
    src/cpp/tcp_algorithms.cpp
    src/cpp/tcp_simulator.cpp
)
target_include_directories(tcp_sim_core PUBLIC src/cpp)

add_executable(tcp_sim_cli src/cpp/main.cpp)
target_link_libraries(tcp_sim_cli PRIVATE tcp_sim_core)

add_executable(test_tcp_sim src/cpp/tests/test_tcp.cpp)
target_link_libraries(test_tcp_sim PRIVATE tcp_sim_core)

# ------------------------------------------------------------------------------
# 2. Network Routing Engine Target
# ------------------------------------------------------------------------------
add_library(routing_sim_core STATIC
    src/cpp/routing/dijkstra.cpp
    src/cpp/routing/distance_vector.cpp
)
target_include_directories(routing_sim_core PUBLIC src/cpp/routing)

add_executable(test_routing_sim src/cpp/tests/test_routing.cpp)
target_link_libraries(test_routing_sim PRIVATE routing_sim_core)

# ------------------------------------------------------------------------------
# 3. Emscripten WebAssembly Targets
# ------------------------------------------------------------------------------
if(EMSCRIPTEN)
    add_executable(tcp_sim_wasm src/cpp/wasm_bridge.cpp)
    target_link_libraries(tcp_sim_wasm PRIVATE tcp_sim_core)
    set_target_properties(tcp_sim_wasm PROPERTIES
        OUTPUT_NAME "tcp_sim_wasm"
        SUFFIX ".js"
        LINK_FLAGS "-s WASM=1 -s EXPORTED_RUNTIME_METHODS=['cwrap','ccall'] -s EXPORTED_FUNCTIONS=['_run_tcp_simulation_wasm','_free_wasm_string'] -s ALLOW_MEMORY_GROWTH=1 -s EXPORT_ES6=1 -s MODULARIZE=1"
    )
endif()
