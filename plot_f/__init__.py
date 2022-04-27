import numpy as np
import matplotlib.pyplot as plt

N = 1000


def f(x, y):
    return np.abs(np.sin(np.abs(x))+np.abs(y)-1)+np.abs(np.power(x,2) +np.power(y,2)-1)


x = np.linspace(-2, 2, N)
y = np.linspace(-3, 3, N)
X, Y = np.meshgrid(x, y)
Z = f(X, Y)


fig = plt.figure()
ax = plt.axes(projection='3d')
ax.set_xlabel('x1')
ax.set_ylabel('x2')
ax.set_zlabel('f')
ax.plot_surface(X, Y, Z,alpha=0.4)

res_x, res_y, res_z = (-0.9828033447265625, 0.16967010498046875, 0.007035377386416686)

ax.scatter(res_x, res_y, res_y, color='red')

plt.show()

